import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. IMPORT THE GEMINI SDK (Requires 'npm install @google/genai')
import { GoogleGenAI } from '@google/genai';
import { ChatSession } from "@google/genai/server";

// Retrieve the API Key from environment variables (Vite requires the VITE_ prefix)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Global variable to hold the chat session instance
let chatSession: ChatSession | null = null;

// --- Safety Logic Function (Run on User Input and enforces vet contact) ---
const checkEmergencyAndGetSafetyResponse = (userInput: string): string | null => {
  const lowerInput = userInput.toLowerCase();
  const emergencyKeywords = [
    "bleeding", "unconscious", "choking", "seizure", 
    "poison", "toxic", "can't breathe", "broken bone", 
    "severe pain", "collapse", "emergency", "immediately", "fever"
  ];

  const isSerious = emergencyKeywords.some(keyword => lowerInput.includes(keyword));

  if (isSerious) {
    return "🛑 **EMERGENCY WARNING:** This sounds like a serious medical emergency. I am an AI and **cannot** provide critical medical advice. **Please contact a licensed veterinarian immediately or use the 'Emergency Consult' button on the My Bookings tab.** Your pet needs professional help now.";
  }

  return null;
};

// --- REAL GEMINI API CALL INTEGRATION ---
const callGeminiAPI = async (userInput: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return "API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file to enable real AI consultation responses.";
  }

  // Initialize chat session if it doesn't exist
  if (!chatSession) {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // System instruction to guide Gemini's behavior
    const systemInstruction = `You are a helpful pet care assistant. Provide short, sweet, and informative advice. ALWAYS include a brief disclaimer at the end of your response, such as 'For persistent or severe symptoms, please consult a licensed veterinarian immediately.' You MUST NOT provide any critical diagnosis or replacement for a vet. Your primary model is to offer general advice and promote contacting a vet for serious issues.`;

    chatSession = ai.chats.create({
      model: "gemini-2.5-flash", 
      config: {
        systemInstruction: systemInstruction,
      }
    });
  }

  try {
    const response = await chatSession.sendMessage({ message: userInput });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "I ran into an error connecting to the AI service. Please check your API key or try again later.";
  }
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your pet care assistant powered by AI. I can offer general guidance on pet care, but remember: I am not a substitute for a licensed veterinarian. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const latestUserInput = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: latestUserInput,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // --- STEP 1: Run IMMEDIATE Safety Check on User Input ---
    const emergencySafetyResponse = checkEmergencyAndGetSafetyResponse(latestUserInput);

    if (emergencySafetyResponse) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: emergencySafetyResponse,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    // --- STEP 2: Call the Real Gemini API ---
    try {
      const aiResponseContent = await callGeminiAPI(latestUserInput);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Gemini API call failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I ran into an error while processing your request. Please check the console for details.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button (Unchanged) */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[var(--shadow-hover)] transition-all duration-300 hover:scale-110",
          "bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))]",
          isOpen && "scale-0"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-96 transition-all duration-300 origin-bottom-right z-50",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Card className="h-[600px] flex flex-col shadow-[var(--shadow-hover)] overflow-hidden border-2 border-primary/20">
          {/* Header (Unchanged) */}
          <div className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Pet Care AI</h3>
                <p className="text-xs text-primary-foreground/80">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md",
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm",
                      // Highlight emergency warnings
                      message.content.startsWith("🛑") && "bg-destructive/10 border border-destructive/50"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p> {/* Use whitespace-pre-wrap to respect Gemini's formatting */}
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input (Unchanged) */}
          <div className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border-border/50 focus:border-primary"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] hover:shadow-[var(--shadow-soft)] transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};