import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyCQhZZ25yfwN_-jSvjdQ2qgn673SWDdb6M';
const MODELS_TO_TEST = [
  'models/gemini-2.5-flash',
  'models/gemini-2.5-flash-lite',
  'models/gemini-2.5-pro',
  'models/gemini-2.0-flash-exp',
  'models/gemini-1.5-pro',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-flash-8b',
  'models/gemini-pro'
];

export async function GET() {
  const results = [];
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    for (const modelName of MODELS_TO_TEST) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Try a simple generation
        const result = await Promise.race([
          model.generateContent('test'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        
        const response = await (result as any).response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: 'working',
          response: text.substring(0, 100),
          error: null
        });
        
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'failed',
          response: null,
          error: error.message || error.toString()
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      results,
      workingModels: results.filter(r => r.status === 'working').map(r => r.model)
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      results 
    }, { status: 500 });
  }
}
