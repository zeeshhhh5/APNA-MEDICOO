"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Loader2,
  Brain, MessageSquare, Send,
} from "lucide-react";
import { toast } from "sonner";

export default function VideoCallPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Hello! I'm Dr. Aryan. Tell me what symptoms are you experiencing?");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [textInput, setTextInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to hold latest transcript — avoids stale closure in recognition.onend
  const transcriptRef = useRef("");

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch {
      toast.error("Camera access denied. You can still use text chat.");
      setIsVideoOn(false);
      return false;
    }
  }, []);

  // Initialize call
  useEffect(() => {
    const init = async () => {
      await startCamera();
      setIsConnecting(false);
      toast.success("Connected to Dr. Aryan AI Video Consultation");
    };
    init();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
    };
  }, [startCamera]);

  // Call timer
  useEffect(() => {
    if (!isConnecting) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnecting]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Send message to AI
  const sendToAI = async (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text }]);
    setIsAiSpeaking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: text },
          ],
        }),
      });

      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const d = line.slice(6);
            if (d === "[DONE]") break;
            try {
              const parsed = JSON.parse(d);
              if (parsed.text) full += parsed.text;
            } catch {}
          }
        }
      }

      setAiResponse(full || "I understand. Could you tell me more about your symptoms?");
      setChatMessages(prev => [...prev, { role: "assistant", text: full }]);

      // Speak the response using Web Speech API
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(full.slice(0, 500));
        utterance.lang = "en-IN";
        utterance.rate = 0.95;
        utterance.onend = () => setIsAiSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsAiSpeaking(false);
      }
    } catch {
      setAiResponse("I'm having trouble connecting. Please try again.");
      setIsAiSpeaking(false);
    }
  };

  // Voice recognition
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechAPI) {
      toast.error("Voice not supported. Use text input instead.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      // Use ref value — avoids stale state closure
      if (transcriptRef.current.trim()) {
        sendToAI(transcriptRef.current.trim());
        transcriptRef.current = "";
        setTranscript("");
      }
      return;
    }

    const recognition = new SpeechAPI();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        final += e.results[i][0].transcript;
      }
      transcriptRef.current = final;
      setTranscript(final);
    };
    recognition.onend = () => {
      setIsListening(false);
      // Use ref to get latest transcript value (not stale state)
      const captured = transcriptRef.current.trim();
      if (captured) {
        sendToAI(captured);
        transcriptRef.current = "";
        setTranscript("");
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      transcriptRef.current = "";
      setTranscript("");
    };
    recognitionRef.current = recognition;
    transcriptRef.current = "";
    setTranscript("");
    recognition.start();
    setIsListening(true);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => (t.enabled = !isVideoOn ? true : false));
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => (t.enabled = !isAudioOn ? true : false));
    }
    setIsAudioOn(!isAudioOn);
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.speechSynthesis?.cancel();
    toast.info(`Call ended (${formatTime(callDuration)})`);
    router.push("/dashboard/ai-doctor");
  };

  const handleTextSend = () => {
    if (!textInput.trim()) return;
    sendToAI(textInput.trim());
    setTextInput("");
  };

  if (isConnecting) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Connecting to Dr. Aryan AI...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up camera and microphone</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-900">
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* AI Doctor Display */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-28 h-28 rounded-full bg-purple-500/80 flex items-center justify-center mx-auto mb-4 ${isAiSpeaking ? "ring-4 ring-purple-400 animate-pulse" : ""}`}>
                <Brain className="h-14 w-14 text-white" />
              </div>
              <h2 className="text-white text-xl font-semibold">Dr. Aryan AI</h2>
              <p className="text-purple-200 text-xs mt-1">{isAiSpeaking ? "Speaking..." : "Listening..."}</p>
              <div className="mt-4 max-w-md mx-auto px-6">
                <div className="bg-black/30 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <p className="text-white text-sm leading-relaxed">{aiResponse.slice(0, 300)}{aiResponse.length > 300 ? "..." : ""}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Timer */}
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <p className="text-white text-sm font-mono">{formatTime(callDuration)}</p>
          </div>

          {/* Transcript Display */}
          {(isListening || transcript) && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-lg w-full px-4">
              <div className="bg-black/60 rounded-xl px-4 py-2 backdrop-blur-sm">
                <p className="text-green-300 text-xs font-medium mb-1">You're saying:</p>
                <p className="text-white text-sm">{transcript || "Listening..."}</p>
              </div>
            </div>
          )}

          {/* Local Video Preview */}
          <div className="absolute bottom-4 right-4 w-44 h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-xl">
            {isVideoOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" style={{ transform: "scaleX(-1)" }} />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-black/50 rounded px-1.5 py-0.5">
              <p className="text-white text-[10px]">You</p>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="hidden md:flex w-72 flex-col bg-gray-800 border-l border-gray-700">
          <div className="px-3 py-2 border-b border-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-400" />
            <span className="text-white text-sm font-medium">Live Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((m, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 text-xs ${m.role === "user" ? "bg-sky-600/30 text-sky-100 ml-4" : "bg-purple-600/30 text-purple-100 mr-4"}`}>
                <p className="font-medium text-[10px] mb-0.5 opacity-70">{m.role === "user" ? "You" : "Dr. Aryan"}</p>
                <p className="leading-relaxed">{m.text.slice(0, 200)}{m.text.length > 200 ? "..." : ""}</p>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-8">Speak or type to start conversation</p>
            )}
          </div>
          <div className="p-2 border-t border-gray-700">
            <div className="flex gap-1.5">
              <input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTextSend()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 border-0 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <Button onClick={handleTextSend} size="sm" className="bg-purple-500 hover:bg-purple-600 h-8 w-8 p-0 rounded-lg">
                <Send className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/90 backdrop-blur-sm px-6 py-4 border-t border-gray-700">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          <Button
            onClick={toggleAudio}
            size="lg"
            className={`rounded-full h-12 w-12 p-0 ${isAudioOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isAudioOn ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
          </Button>

          <Button
            onClick={toggleListening}
            size="lg"
            className={`rounded-full h-12 w-12 p-0 ${isListening ? "bg-green-500 hover:bg-green-600 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            <Brain className="h-5 w-5 text-white" />
          </Button>

          <Button
            onClick={endCall}
            size="lg"
            className="rounded-full h-14 w-14 p-0 bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </Button>

          <Button
            onClick={toggleVideo}
            size="lg"
            className={`rounded-full h-12 w-12 p-0 ${isVideoOn ? "bg-gray-600 hover:bg-gray-500" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isVideoOn ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
          </Button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          Press the brain icon to speak • Type in chat sidebar • Red button to end
        </p>
      </div>
    </div>
  );
}
