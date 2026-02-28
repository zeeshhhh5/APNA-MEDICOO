import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendMessage, initializeGemini, isInitialized } from "@/services/geminiService";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { consultationId, messages } = await req.json();

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

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role === "user" ? "Patient" : "Dr. Aryan"}: ${m.content}`)
      .join("\n");

    const reportPrompt = `Based on the following medical consultation, generate a comprehensive medical report in JSON format.

Consultation:
${conversationText}

Patient Info:
- Name: ${user.name}
- Allergies: ${user.patient?.allergies?.join(", ") || "None"}
- Current Medications: ${user.patient?.currentMedications?.join(", ") || "None"}

IMPORTANT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks, no explanations, just pure JSON):
{
  "diagnosis": "string (possible diagnosis based on symptoms discussed)",
  "emergencyLevel": "NONE|LOW|MEDIUM|HIGH|CRITICAL",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "recommendedMedicines": [
    {"name": "medicine name", "dosage": "dosage info", "duration": "duration", "notes": "important notes"}
  ],
  "lifestyle": ["lifestyle advice 1", "lifestyle advice 2"],
  "followUp": "follow-up recommendation",
  "requiresAmbulance": false,
  "disclaimer": "This is AI-assisted guidance and not a replacement for professional medical advice. Please consult a healthcare professional for accurate diagnosis and treatment."
}

Generate the report now:`;

    // Use the robust Gemini service with retry logic
    const response = await sendMessage(reportPrompt);
    
    // Clean up markdown code blocks if present
    let text = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Extract JSON if there's any surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    let reportJson;
    try {
      reportJson = JSON.parse(text);
    } catch (parseError) {
      console.error("[REPORT_PARSE_ERROR]", parseError);
      // Fallback report structure
      reportJson = {
        diagnosis: "Unable to generate detailed report. Please consult with a healthcare professional.",
        emergencyLevel: "LOW",
        symptoms: messages.filter((m: any) => m.role === "user").map((m: any) => m.content.substring(0, 50)),
        recommendedMedicines: [],
        lifestyle: ["Maintain healthy diet", "Stay hydrated", "Get adequate rest"],
        followUp: "Consult with a doctor if symptoms persist",
        requiresAmbulance: false,
        disclaimer: "This is AI-assisted guidance and not a replacement for professional medical advice."
      };
    }

    if (consultationId) {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          report: reportJson,
          diagnosis: reportJson.diagnosis,
          medicines: reportJson.recommendedMedicines,
          emergencyLevel: reportJson.emergencyLevel,
          status: "COMPLETED",
        },
      });

      if (user.patient) {
        await prisma.healthRecord.create({
          data: {
            patientId: user.patient.id,
            type: "CONSULTATION",
            title: `AI Consultation - ${new Date().toLocaleDateString("en-IN")}`,
            description: reportJson.diagnosis,
            data: reportJson,
          },
        });
      }
    }

    return NextResponse.json({ report: reportJson });
  } catch (error: any) {
    console.error("[AI_REPORT]", error);
    
    // Return fallback report on error
    const fallbackReport = {
      diagnosis: "Service temporarily unavailable. Please try again.",
      emergencyLevel: "LOW",
      symptoms: [],
      recommendedMedicines: [],
      lifestyle: ["Consult with a healthcare professional"],
      followUp: "Please try generating the report again",
      requiresAmbulance: false,
      disclaimer: "This is AI-assisted guidance and not a replacement for professional medical advice."
    };
    
    return NextResponse.json({ 
      report: fallbackReport,
      error: error.message || "Failed to generate report"
    });
  }
}
