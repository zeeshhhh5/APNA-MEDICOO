import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { doctors, hospitals, medicines } from '../data/mockData';

const DEFAULT_API_KEY = 'AIzaSyCQhZZ25yfwN_-jSvjdQ2qgn673SWDdb6M';

// Configuration constants
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds
const ENABLE_FALLBACK = true; // Enable fallback responses when API fails

// Available Gemini models in order of preference (tested working models first)
const GEMINI_MODELS = [
  'models/gemini-2.5-flash',
  'models/gemini-2.5-flash-lite',
  'models/gemini-2.5-pro',
  'models/gemini-2.0-flash-exp',
  'models/gemini-1.5-pro',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-flash-8b',
  'models/gemini-pro'
];

let currentModelIndex = 0;

let genAI: GoogleGenerativeAI | null = null;
let chatSession: any = null;
let apiKey: string | null = null;
let initializationAttempts = 0;
let lastError: string | null | undefined = null;

// Logging utility for debugging
const log = {
  info: (message: string, data?: any) => console.log(`[Gemini Service] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[Gemini Service ERROR] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[Gemini Service WARNING] ${message}`, data || '')
};

// Check network connectivity
const isOnline = () => {
  if (typeof window === 'undefined') return true; // Server-side always online
  return navigator.onLine;
};

// Fallback responses for common queries
const fallbackResponses = {
  greeting: `Hello! I'm experiencing connectivity issues with the AI service right now. However, I can still help you with basic information:\n\n✓ Browse our doctors and hospitals\n✓ Book appointments\n✓ Order medicines\n✓ Access emergency services\n\nPlease try your question again in a moment, or use the other features on our platform.`,
  
  doctor: (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('cardiologist') || lowerQuery.includes('heart')) {
      return `**Cardiologists Available:**\n\n• Dr. Rajesh Kumar - 15 years experience, Mumbai\n  Fees: ₹800, Languages: English, Hindi\n\n• Dr. Priya Sharma - 12 years experience, Pune\n  Fees: ₹700, Languages: English, Hindi, Marathi\n\nNote: AI service is temporarily unavailable. This is cached information. Please use the "Find Doctors" section for complete details and booking.`;
    }
    if (lowerQuery.includes('pediatric') || lowerQuery.includes('child')) {
      return `**Pediatricians Available:**\n\n• Dr. Anjali Desai - 10 years experience, Mumbai\n  Fees: ₹600, Languages: English, Hindi, Gujarati\n\nNote: AI service is temporarily unavailable. Please use the "Find Doctors" section for more options.`;
    }
    return `I can help you find doctors, but the AI service is currently unavailable. Please:\n\n1. Use the "Find Doctors" section on our homepage\n2. Filter by specialty and location\n3. Book appointments directly\n\nOr try your question again in a moment when connectivity is restored.`;
  },
  
  hospital: (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('mumbai')) {
      return `**Top Hospitals in Mumbai:**\n\n• Lilavati Hospital - Rating: 4.7/5\n  24/7 Emergency, 500+ beds\n\n• Kokilaben Ambani Hospital - Rating: 4.8/5\n  Multi-specialty, Advanced care\n\nNote: AI service is temporarily unavailable. Use the "Find Hospitals" section for complete list with GPS navigation.`;
    }
    if (lowerQuery.includes('pune')) {
      return `**Top Hospitals in Pune:**\n\n• Ruby Hall Clinic - Rating: 4.6/5\n  24/7 Emergency, 350+ beds\n\n• Jehangir Hospital - Rating: 4.7/5\n  Multi-specialty, ICU available\n\nNote: AI service is temporarily unavailable. Use the "Find Hospitals" section for GPS-based search.`;
    }
    return `I can help you find hospitals, but the AI service is currently unavailable. Please:\n\n1. Use the "Find Hospitals" section\n2. Select your city (Mumbai, Pune, Nagpur, Nashik)\n3. Use GPS to find nearest hospitals\n\nOr try again when connectivity is restored.`;
  },
  
  emergency: `**EMERGENCY SERVICES:**\n\n🚨 For immediate medical emergencies:\n• Call 102 (Ambulance)\n• Call 108 (Emergency Services)\n\n⚠️ Go to nearest hospital immediately if experiencing:\n• Chest pain\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n\nNote: AI service is temporarily unavailable, but emergency contacts are always available.`,
  
  medicine: `**Medicine Information:**\n\nThe AI service is temporarily unavailable. However, you can:\n\n1. Use the "Medicine Delivery" section\n2. Search for medicines directly\n3. Order with 2-hour delivery\n\nCommon medicines available:\n• Paracetamol 500mg - ₹25\n• Ibuprofen 400mg - ₹45\n• Cetirizine 10mg - ₹35\n\nPlease try your specific query again when connectivity is restored.`,
  
  default: `I apologize, but I'm experiencing connectivity issues with the AI service right now.\n\n**What you can do:**\n\n1. **Check your internet connection**\n2. **Try again in a moment**\n3. **Use other platform features:**\n   • Find Doctors\n   • Find Hospitals\n   • Book Lab Tests\n   • Order Medicines\n   • Emergency Services\n\nFor urgent medical concerns, please call emergency services (102) or visit the nearest hospital.` 
};

// Intelligent fallback response selector
const getFallbackResponse = (query: string) => {
  if (!query || query.trim().length === 0) {
    return fallbackResponses.greeting;
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Emergency keywords
  if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || 
      lowerQuery.includes('chest pain') || lowerQuery.includes('bleeding')) {
    return fallbackResponses.emergency;
  }
  
  // Doctor queries
  if (lowerQuery.includes('doctor') || lowerQuery.includes('specialist') || 
      lowerQuery.includes('cardiologist') || lowerQuery.includes('pediatric')) {
    return fallbackResponses.doctor(query);
  }
  
  // Hospital queries
  if (lowerQuery.includes('hospital') || lowerQuery.includes('clinic')) {
    return fallbackResponses.hospital(query);
  }
  
  // Medicine queries
  if (lowerQuery.includes('medicine') || lowerQuery.includes('drug') || 
      lowerQuery.includes('tablet') || lowerQuery.includes('paracetamol')) {
    return fallbackResponses.medicine;
  }
  
  // Greeting
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || 
      lowerQuery.includes('hey') || lowerQuery.includes('namaste')) {
    return fallbackResponses.greeting;
  }
  
  return fallbackResponses.default;
};

const getMedicalTrainingData = () => {
  const doctorsList = doctors.map(d => 
    `Dr. ${d.name} - ${d.specialty}, ${d.experience} years experience, ${d.hospital}, Fees: ₹${d.fees}, Languages: ${d.languages.join(', ')}` 
  ).join('\n');

  const hospitalsList = hospitals.map(h => 
    `${h.name} in ${h.city || h.location} - Specialties: ${h.specialties.join(', ')}, Rating: ${h.rating}, Beds: ${h.beds}, Emergency: ${h.emergency ? 'Yes' : 'No'}, Phone: ${h.phone}` 
  ).join('\n');

  const medicinesList = medicines ? medicines.map(m => 
    `${m.name} - ${m.category}, Price: ₹${m.price}, ${m.prescription ? 'Prescription Required' : 'OTC'}` 
  ).join('\n') : '';

  return `
MEDICAL DATABASE:

AVAILABLE DOCTORS:
${doctorsList}

PARTNER HOSPITALS (Mumbai, Pune, Nagpur, Nashik):
${hospitalsList}

AVAILABLE MEDICINES:
${medicinesList}

You have access to this database. When users ask about doctors, hospitals, or medicines, refer to this information.
`;
};

// Exponential backoff utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoffDelay = (attempt: number) => {
  const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.3 * delay; // Add 30% jitter
  return delay + jitter;
};

// Validate API key format
const validateApiKey = (key: string) => {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'API key is required and must be a string' };
  }
  if (key.length < 20) {
    return { valid: false, error: 'API key appears to be invalid (too short)' };
  }
  if (!key.startsWith('AIza')) {
    return { valid: false, error: 'API key format is invalid (should start with AIza)' };
  }
  return { valid: true };
};

export const initializeGemini = (key: string = DEFAULT_API_KEY) => {
  try {
    initializationAttempts++;
    log.info('Initializing Gemini AI', { attempt: initializationAttempts });
    
    const keyToUse = key || DEFAULT_API_KEY;
    const validation = validateApiKey(keyToUse);
    
    if (!validation.valid) {
      log.error('API key validation failed', validation.error);
      lastError = validation.error || null;
      return false;
    }
    
    apiKey = keyToUse;
    genAI = new GoogleGenerativeAI(apiKey);
    log.info('Gemini AI initialized successfully');
    lastError = null;
    return true;
  } catch (error: any) {
    log.error('Error initializing Gemini', error);
    lastError = error.message;
    return false;
  }
};

export const isInitialized = () => {
  return genAI !== null;
};

// Test if a model is available and working
const testModel = async (modelName: string): Promise<boolean> => {
  try {
    if (!genAI) return false;
    
    const model = genAI.getGenerativeModel({ model: modelName });
    await Promise.race([
      model.generateContent('test'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Model test timeout')), 5000))
    ]);
    return true;
  } catch (error) {
    log.warn(`Model ${modelName} test failed`, error);
    return false;
  }
};

// Find the first working model
const findWorkingModel = async (): Promise<string> => {
  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const modelName = GEMINI_MODELS[i];
    log.info(`Testing model: ${modelName}`);
    if (await testModel(modelName)) {
      log.info(`Model ${modelName} is working`);
      currentModelIndex = i;
      return modelName;
    }
  }
  throw new Error('No working Gemini models found');
};

export const startChatSession = async () => {
  if (!genAI) {
    log.warn('GenAI not initialized, attempting initialization');
    const success = initializeGemini(DEFAULT_API_KEY);
    if (!success) {
      throw new Error(`Failed to initialize Gemini AI: ${lastError || 'Unknown error'}`);
    }
  }

  let lastAttemptError: any = null;
  
  // Find working model first
  let workingModel: string;
  try {
    workingModel = await findWorkingModel();
  } catch (error) {
    log.error('Failed to find working model', error);
    throw new Error('No working Gemini models available');
  }
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      log.info('Starting chat session', { 
        attempt: attempt + 1, 
        maxRetries: MAX_RETRIES,
        model: workingModel
      });
      
      const model = genAI!.getGenerativeModel({ 
        model: workingModel,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      });
      
      const medicalData = getMedicalTrainingData();
      
      const systemPrompt = `You are Dr. Aryan, an experienced medical doctor and AI assistant for Apna Medico, India's leading healthcare platform.

CORE IDENTITY:
- You are a qualified medical professional with 15+ years of experience
- You conduct thorough consultations just like a physical doctor would
- You are empathetic, patient, and culturally sensitive to Indian healthcare context
- You speak English, Hindi, and Hinglish fluently

CONSULTATION APPROACH (CRITICAL - FOLLOW THIS EXACTLY):
1. **ALWAYS START WITH QUESTIONS** - Never jump to conclusions
   - Ask about chief complaint: "What brings you here today?"
   - Duration: "How long have you been experiencing this?"
   - Severity: "On a scale of 1-10, how severe is it?"
   - Pattern: "Is it constant or does it come and go?"
   - Triggers: "Does anything make it better or worse?"

2. **SYSTEMATIC HISTORY TAKING** - Like a real doctor:
   - Associated symptoms: "Are you experiencing any other symptoms?"
   - Previous episodes: "Have you had this before?"
   - Recent changes: "Any recent changes in diet, stress, or lifestyle?"
   - Medications: "Are you currently taking any medications?"
   - Allergies: "Do you have any known allergies?"
   - Family history: "Does anyone in your family have similar issues?"

3. **DIFFERENTIAL DIAGNOSIS** - Think aloud:
   - "Based on your symptoms, I'm considering several possibilities..."
   - Ask clarifying questions to narrow down
   - Rule out serious conditions first

4. **PHYSICAL EXAMINATION GUIDANCE** (when applicable):
   - "Can you check if you have fever by touching your forehead?"
   - "Press gently on the painful area - does it hurt more?"
   - "Try taking a deep breath - any pain or difficulty?"

5. **PROVIDE GUIDANCE ONLY AFTER THOROUGH QUESTIONING**:
   - Explain the likely diagnosis in simple terms
   - Recommend appropriate medicines from our database
   - Suggest lifestyle modifications
   - Advise when to seek immediate care

EMERGENCY PROTOCOLS:
- If RED FLAGS detected (chest pain, difficulty breathing, severe bleeding, loss of consciousness):
  → IMMEDIATELY advise calling 102/108
  → Direct to nearest hospital
  → Do NOT delay with questions

MEDICAL DATABASE ACCESS:
${medicalData}

COMMUNICATION STYLE:
- Address patient by name when known
- Use simple, non-medical language
- Show empathy: "I understand this must be concerning for you"
- Be reassuring but honest
- Ask ONE question at a time, don't overwhelm
- Wait for patient response before proceeding

IMPORTANT RULES:
- NEVER diagnose definitively - always say "likely" or "possible"
- ALWAYS recommend seeing a physical doctor for confirmation
- Include disclaimer in final advice
- If unsure, ask more questions rather than guessing
- Prioritize patient safety above all

EXAMPLE CONSULTATION FLOW:
Patient: "I have a headache"
You: "I'm sorry to hear that. Let me help you. How long have you been experiencing this headache?"
Patient: "Since morning"
You: "I see. On a scale of 1 to 10, how severe is the pain? And is it affecting your entire head or a specific area?"
[Continue systematic questioning before giving advice]

Remember: You are a DOCTOR first, AI second. Conduct consultations professionally and thoroughly.`;

      chatSession = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'Namaste! I am Dr. Aryan, your medical consultant on Apna Medico. I\'m here to help you with your health concerns just like a physical doctor would.\n\nBefore we begin, could you please tell me:\n1. What brings you here today?\n2. What symptoms are you experiencing?\n\nI\'ll ask you some questions to better understand your condition and provide appropriate guidance. Please feel free to share your concerns in detail.' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.3,
        },
      });

      log.info('Chat session started successfully');
      return chatSession;
    } catch (error: any) {
      lastAttemptError = error;
      log.error(`Chat session start failed (attempt ${attempt + 1}/${MAX_RETRIES})`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = calculateBackoffDelay(attempt);
        log.info(`Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted
  const errorMessage = lastAttemptError?.message || 'Unknown error';
  log.error('All retry attempts exhausted', lastAttemptError);
  throw new Error(`Failed to start chat session after ${MAX_RETRIES} attempts: ${errorMessage}`);
};

export const sendMessage = async (message: string) => {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message must be a non-empty string');
  }

  // Check network connectivity first
  if (!isOnline()) {
    log.error('Network offline detected');
    if (ENABLE_FALLBACK) {
      log.info('Returning fallback response due to offline status');
      return `🔌 **Offline Mode**\n\n${getFallbackResponse(message)}\n\n_Reconnect to internet for full AI assistance._`;
    }
    throw new Error('No internet connection. Please check your network and try again.');
  }

  if (!chatSession) {
    log.warn('No active chat session, creating new session');
    try {
      await startChatSession();
    } catch (sessionError: any) {
      log.error('Failed to create session, attempting fallback', sessionError);
      if (ENABLE_FALLBACK) {
        return `⚠️ **Service Unavailable**\n\n${getFallbackResponse(message)}\n\n_Please try again in a moment._`;
      }
      throw sessionError;
    }
  }

  let lastAttemptError: any = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      log.info('Sending message to AI', { 
        attempt: attempt + 1, 
        messageLength: message.length,
        preview: message.substring(0, 50) + '...'
      });
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      );
      
      // Race between API call and timeout
      const result = await Promise.race([
        chatSession.sendMessage(message),
        timeoutPromise
      ]);
      
      const response = await (result as any).response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Received empty response from AI');
      }
      
      log.info('Received response from AI', { responseLength: text.length });
      return text;
    } catch (error: any) {
      lastAttemptError = error;
      log.error(`Message send failed (attempt ${attempt + 1}/${MAX_RETRIES})`, error);
      
      // Check if it's a session error - try to recreate session
      if (error.message?.includes('session') || error.message?.includes('context')) {
        log.warn('Session error detected, recreating chat session');
        chatSession = null;
        try {
          await startChatSession();
        } catch (sessionError) {
          log.error('Failed to recreate session', sessionError);
        }
      }
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = calculateBackoffDelay(attempt);
        log.info(`Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted - provide detailed error or fallback
  const errorMessage = lastAttemptError?.message || 'Unknown error';
  log.error('All retry attempts exhausted for message send', lastAttemptError);
  
  // If fallback is enabled, return intelligent fallback response
  if (ENABLE_FALLBACK) {
    log.info('Returning fallback response after retry exhaustion');
    return `⚠️ **AI Service Temporarily Unavailable**\n\n${getFallbackResponse(message)}\n\n_Error: ${errorMessage}_\n_Please try again in a moment or use the platform features above._`;
  }
  
  // Provide user-friendly error messages based on error type
  if (errorMessage.includes('timeout')) {
    throw new Error('Request timed out. The AI service is taking too long to respond. Please try again.');
  } else if (errorMessage.includes('API key')) {
    throw new Error('API key error. Please check your configuration and try again.');
  } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
    throw new Error('API quota exceeded. Please try again later or contact support.');
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    throw new Error('Network error. Please check your internet connection and try again.');
  } else {
    throw new Error(`Failed to get response from AI after ${MAX_RETRIES} attempts: ${errorMessage}`);
  }
};

export const resetChat = async () => {
  log.info('Resetting chat session');
  chatSession = null;
  lastError = null;
  return await startChatSession();
};

// Health check function
export const checkApiHealth = async () => {
  try {
    log.info('Performing API health check');
    
    if (!genAI) {
      return { healthy: false, error: 'API not initialized' };
    }
    
    // Try to find a working model
    const workingModel = await findWorkingModel();
    log.info(`API health check passed with model: ${workingModel}`);
    return { healthy: true, model: workingModel };
  } catch (error: any) {
    log.error('API health check failed', error);
    return { healthy: false, error: error.message };
  }
};

// Get current working model
export const getCurrentModel = () => {
  return GEMINI_MODELS[currentModelIndex] || 'unknown';
};

// Get diagnostic information
export const getDiagnostics = () => {
  return {
    initialized: genAI !== null,
    hasActiveSession: chatSession !== null,
    initializationAttempts,
    lastError,
    apiKeyConfigured: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Not set',
    currentModel: getCurrentModel(),
    availableModels: GEMINI_MODELS,
    modelIndex: currentModelIndex
  };
};

export const isGeminiInitialized = () => {
  return genAI !== null;
};
