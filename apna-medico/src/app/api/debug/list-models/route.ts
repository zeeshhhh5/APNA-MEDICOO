import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyCQhZZ25yfwN_-jSvjdQ2qgn673SWDdb6M';

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try to list available models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY);
    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      models: data.models || [],
      rawResponse: data
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
