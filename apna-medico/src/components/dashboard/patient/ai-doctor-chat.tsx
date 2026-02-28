"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Loader2, AlertTriangle, FileText,
  Ambulance, Mic, MicOff, RefreshCw, User, Stethoscope,
  Video, Phone, History, Plus, MessageSquare, Download,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Report {
  diagnosis: string;
  emergencyLevel: string;
  symptoms: string[];
  recommendedMedicines: { name: string; dosage: string; duration: string; notes: string }[];
  lifestyle: string[];
  followUp: string;
  requiresAmbulance: boolean;
  disclaimer: string;
}

const EMERGENCY_LEVELS: Record<string, { color: string; bg: string; label: string }> = {
  NONE:     { color: "text-green-600",  bg: "bg-green-50 border-green-200",  label: "No Emergency" },
  LOW:      { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Low Concern" },
  MEDIUM:   { color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Moderate" },
  HIGH:     { color: "text-red-600",    bg: "bg-red-50 border-red-200",       label: "High — Seek Care" },
  CRITICAL: { color: "text-red-700",    bg: "bg-red-100 border-red-400",      label: "CRITICAL — Call 108!" },
};

interface ChatSession {
  id: string;
  createdAt: string;
  diagnosis: string | null;
  status: string;
  messageCount: number;
}

export default function AiDoctorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [patientAllergies, setPatientAllergies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Load chat history & patient allergies on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [histRes, profRes] = await Promise.all([
          fetch("/api/consultations").then(r => r.json()).catch(() => ({ consultations: [] })),
          fetch("/api/patients/profile").then(r => r.json()).catch(() => ({ profile: null })),
        ]);
        if (histRes.consultations) {
          const sessions: ChatSession[] = histRes.consultations.map((c: any) => ({
            id: c.id,
            createdAt: c.createdAt,
            diagnosis: c.diagnosis,
            status: c.status,
            messageCount: Array.isArray(c.messages) ? c.messages.length : 0,
          }));
          setChatHistory(sessions);
        }
        if (profRes.profile?.allergies) {
          setPatientAllergies(profRes.profile.allergies);
        }
      } catch {}
    };
    loadData();
    startNewChat();
  }, []);

  const startNewChat = () => {
    const allergyWarning = patientAllergies.length > 0
      ? `\n\n⚠️ I can see from your profile that you have the following allergies: **${patientAllergies.join(", ")}**. I'll keep this in mind when suggesting any medicines.`
      : "";
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Namaste! I'm Dr. Aryan, your AI health assistant on Apna Medico. I'm here to help you understand your symptoms and guide you to the right care.\n\nPlease describe what you're experiencing today — symptoms, duration, and any existing conditions or allergies you have. The more details you share, the better I can assist you.${allergyWarning}`,
        timestamp: new Date(),
      },
    ]);
    setConsultationId(null);
    setReport(null);
  };

  const loadPreviousChat = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/consultations?id=${sessionId}`);
      const data = await res.json();
      if (data.consultation) {
        const msgs: Message[] = (data.consultation.messages || []).map((m: any, i: number) => ({
          id: `hist-${i}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(data.consultation.createdAt),
        }));
        if (msgs.length > 0) {
          setMessages(msgs);
          setConsultationId(sessionId);
          if (data.consultation.report) setReport(data.consultation.report);
          setShowHistory(false);
          toast.success("Previous chat loaded");
        }
      }
    } catch {
      toast.error("Failed to load chat history");
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const text = `CONSULTATION REPORT - Apna Medico\n${'='.repeat(40)}\n\nDiagnosis: ${report.diagnosis}\nEmergency Level: ${report.emergencyLevel}\n\nSymptoms: ${report.symptoms?.join(', ')}\n\nRecommended Medicines:\n${report.recommendedMedicines?.map(m => `  - ${m.name}: ${m.dosage} for ${m.duration}${m.notes ? ' (' + m.notes + ')' : ''}`).join('\n')}\n\nLifestyle Advice:\n${report.lifestyle?.map(l => `  - ${l}`).join('\n')}\n\nFollow-Up: ${report.followUp}\n\nDisclaimer: ${report.disclaimer}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startConsultation = async () => {
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CHAT" }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsultationId(data.consultation?.id ?? null);
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!consultationId) {
      await startConsultation();
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const currentInput = input.trim();
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          consultationId,
          allergies: patientAllergies,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: fullContent } : m
                  )
                );
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Check if we got a fallback response in the error
      if (error.fallback) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: error.fallback } : m
          )
        );
        toast.warning("Using offline mode - limited functionality");
      } else {
        toast.error("Failed to get response from Dr. Aryan. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (messages.length < 3) {
      toast.info("Please have a longer conversation before generating a report.");
      return;
    }
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReport(data.report);
    } catch {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => {
      toast.error("Voice recognition error");
      setIsRecording(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const emergencyInfo = report ? EMERGENCY_LEVELS[report.emergencyLevel] ?? EMERGENCY_LEVELS.NONE : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row gap-0">
      {/* Chat Area */}
      <div className="flex flex-1 flex-col bg-white border-r border-gray-100">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Dr. Aryan AI</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-gray-500">Online — GPT-4o Medical Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="gap-1.5">
              <History className="h-3.5 w-3.5 text-gray-500" />
              <span className="hidden sm:inline text-xs">History</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => { startNewChat(); }} className="gap-1.5">
              <Plus className="h-3.5 w-3.5 text-green-500" />
              <span className="hidden sm:inline text-xs">New</span>
            </Button>
            <Link href="/dashboard/ai-doctor/video">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Video className="h-3.5 w-3.5 text-purple-500" />
                <span className="hidden sm:inline text-xs">Video</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={generateReport}
              disabled={generatingReport || messages.length < 3}
              className="gap-1.5"
            >
              {generatingReport ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-sky-500" />
              )}
              <span className="hidden sm:inline text-xs">Report</span>
            </Button>
          </div>
        </div>

        {/* Chat History Panel */}
        {showHistory && (
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 max-h-60 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Previous Conversations</p>
            {chatHistory.length === 0 ? (
              <p className="text-xs text-gray-400">No previous conversations</p>
            ) : (
              <div className="space-y-1.5">
                {chatHistory.slice(0, 10).map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadPreviousChat(s.id)}
                    className={`w-full text-left rounded-lg p-2 text-xs transition-colors hover:bg-white ${s.id === consultationId ? 'bg-white border border-purple-200' : 'bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-purple-400 shrink-0" />
                      <span className="font-medium text-gray-700 truncate">{s.diagnosis || 'General Consultation'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-5">
                      <span className="text-gray-400">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{s.messageCount} messages</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
          <div className="space-y-4 max-w-2xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-purple-100" : "bg-sky-100"}`}>
                    {msg.role === "assistant" ? (
                      <Brain className="h-4 w-4 text-purple-600" />
                    ) : (
                      <User className="h-4 w-4 text-sky-600" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-gray-50 text-gray-800 rounded-tl-sm"
                      : "bg-sky-500 text-white rounded-tr-sm"
                  }`}>
                    {msg.content || (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Describe your symptoms… (e.g. I have fever and headache since 2 days)"
                className="min-h-[44px] max-h-32 resize-none rounded-xl border-gray-200 text-sm"
                rows={1}
              />
              <div className="flex flex-col gap-1">
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 rounded-xl bg-sky-500 hover:bg-sky-600 p-0 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                </Button>
                <Button
                  onClick={toggleVoiceInput}
                  variant="outline"
                  className={`h-10 w-10 rounded-xl p-0 shrink-0 ${isRecording ? "border-red-400 bg-red-50" : ""}`}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Press Enter to send • Shift+Enter for new line • AI guidance only — not a substitute for professional medical advice
            </p>
          </div>
        </div>
      </div>

      {/* Report Panel */}
      <div className="hidden lg:flex w-80 flex-col bg-gray-50 border-l border-gray-100">
        <div className="border-b border-gray-100 px-4 py-3 bg-white">
          <h3 className="font-semibold text-gray-900 text-sm">Consultation Report</h3>
          <p className="text-xs text-gray-400 mt-0.5">Generated after conversation</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {!report ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FileText className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No report yet</p>
              <p className="text-xs text-gray-400 mt-1">Chat with Dr. Aryan and click &quot;Report&quot; to generate</p>
              <Button
                onClick={generateReport}
                disabled={generatingReport || messages.length < 3}
                size="sm"
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white"
              >
                {generatingReport ? (
                  <><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Generating...</>
                ) : (
                  <><FileText className="mr-1 h-3 w-3" />Generate Report</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Emergency Level */}
              {emergencyInfo && (
                <div className={`rounded-xl border p-3 ${emergencyInfo.bg}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${emergencyInfo.color}`} />
                    <span className={`text-sm font-semibold ${emergencyInfo.color}`}>
                      {emergencyInfo.label}
                    </span>
                  </div>
                  {report.requiresAmbulance && (
                    <Link href="/dashboard/ambulance">
                      <Button size="sm" className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs">
                        <Ambulance className="mr-1 h-3 w-3" /> Book Ambulance Now
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Diagnosis */}
              <div className="rounded-xl bg-white border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Possible Diagnosis</p>
                <p className="text-sm text-gray-800">{report.diagnosis}</p>
              </div>

              {/* Symptoms */}
              {report.symptoms?.length > 0 && (
                <div className="rounded-xl bg-white border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Symptoms Identified</p>
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms.map((s) => (
                      <Badge key={s} className="text-xs bg-gray-100 text-gray-700 border-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {report.recommendedMedicines?.length > 0 && (
                <div className="rounded-xl bg-white border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommended Medicines</p>
                  <div className="space-y-2">
                    {report.recommendedMedicines.map((med, i) => (
                      <div key={i} className="rounded-lg bg-emerald-50 p-2">
                        <p className="text-xs font-semibold text-emerald-800">{med.name}</p>
                        <p className="text-xs text-emerald-700">{med.dosage} • {med.duration}</p>
                        {med.notes && <p className="text-xs text-gray-500 mt-0.5">{med.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow Up */}
              {report.followUp && (
                <div className="rounded-xl bg-white border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Follow-Up</p>
                  <p className="text-xs text-gray-700">{report.followUp}</p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 italic">{report.disclaimer}</p>

              <div className="flex gap-2">
                <Button
                  onClick={generateReport}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                </Button>
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Download className="mr-1 h-3 w-3" /> Download
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
