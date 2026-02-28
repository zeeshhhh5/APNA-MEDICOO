import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendMessage, initializeGemini, isInitialized } from "@/services/geminiService";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, consultationId, allergies } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Initialize Gemini if not already initialized
    if (!isInitialized()) {
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCQhZZ25yfwN_-jSvjdQ2qgn673SWDdb6M';
      initializeGemini(apiKey);
    }

    // Merge allergies from profile and frontend
    const allAllergies = [
      ...(user.patient?.allergies || []),
      ...(allergies || []),
    ].filter((v, i, a) => a.indexOf(v) === i);

    // Build patient context
    const allergyWarning = allAllergies.length > 0
      ? `\n⚠️ CRITICAL: Patient has allergies to: ${allAllergies.join(", ")}. NEVER recommend medicines containing these substances. Always check drug ingredients against these allergies before suggesting.`
      : "";

    const patientContext = `
Patient Information:
- Name: ${user.name}
- Blood Group: ${user.patient?.bloodGroup ?? "Unknown"}
- Known Allergies: ${allAllergies.length > 0 ? allAllergies.join(", ") : "None reported"}
- Current Medications: ${user.patient?.currentMedications?.join(", ") || "None reported"}
- Medical History: ${user.patient?.medicalHistory ?? "No history provided"}
${allergyWarning}
Please address the patient by name and consider their medical history, allergies, and current medications in your response. If suggesting medicines, explicitly state that none of them contain the patient's known allergens.`;

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || "";
    const messageWithContext = `${patientContext}\n\nPatient Query: ${lastMessage}`;

    // Send message using the robust Gemini service with retry logic and fallback
    const response = await sendMessage(messageWithContext);

    // Save to consultation if ID provided
    if (consultationId && response) {
      try {
        const existing = await prisma.consultation.findUnique({
          where: { id: consultationId },
        });
        if (existing) {
          const existingMessages = Array.isArray(existing.messages) ? existing.messages as object[] : [];
          await prisma.consultation.update({
            where: { id: consultationId },
            data: {
              messages: [
                ...existingMessages,
                { role: "user", content: lastMessage, timestamp: new Date().toISOString() },
                { role: "assistant", content: response, timestamp: new Date().toISOString() },
              ],
            },
          });
        }
      } catch (e) {
        console.error("[CHAT_SAVE]", e);
      }
    }

    // Stream the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        // Split response into chunks for streaming effect
        const words = response.split(' ');
        let index = 0;
        
        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = words[index] + ' ';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            index++;
          } else {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
            clearInterval(interval);
          }
        }, 50); // Stream word by word
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[AI_CHAT]", error);
    
    // Return user-friendly error message
    const errorMessage = error.message || "Internal server error";
    return NextResponse.json({ 
      error: errorMessage,
      fallback: "The AI service is temporarily unavailable. Please try again in a moment or use other platform features."
    }, { status: 500 });
  }
}
