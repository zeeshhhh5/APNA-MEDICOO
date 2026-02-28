import { NextResponse } from "next/server";
import { sendMessage, initializeGemini, isInitialized } from "@/services/geminiService";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Initialize if not already done
    if (!isInitialized()) {
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCQhZZ25yfwN_-jSvjdQ2qgn673SWDdb6M';
      initializeGemini(apiKey);
    }
    
    // Send message using the Gemini service
    const response = await sendMessage(message);
    
    return NextResponse.json({ 
      success: true,
      response: response,
      model: "working"
    });
    
  } catch (error: any) {
    console.error("[CHAT_TEST]", error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      fallback: "The AI service is temporarily unavailable. Please try again in a moment."
    }, { status: 500 });
  }
}
