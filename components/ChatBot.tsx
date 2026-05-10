
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, RotateCcw, ExternalLink, Minus, Search } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { CareerAnalysis } from '../types';
import { assertGeminiApiKey, getChatModel, openAiStudioKeySelector } from '../services/geminiConfig';

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

interface ChatBotProps {
  analysis: CareerAnalysis | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Neural Research Link active. Grounded by Google Search for 2025 market trends. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<Chat | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const initChat = () => {
    const ai = new GoogleGenAI({ apiKey: assertGeminiApiKey() });
    let systemInstruction = "You are the Career Clarity Core Research Assistant. You have LIVE ACCESS to the internet via Google Search tools. ALWAYS use this tool to verify current salary data, company reviews, or job market shifts. STICK TO THE SALARY STRUCTURE: When discussing pay for any role, strictly provide 'Expected Base Salary' and 'Ceiling/Potential'.";
    
    if (analysis) {
      systemInstruction += ` Context: Current target is ${analysis.matchScore}% ready. Market sentiment: ${analysis.marketInsights.marketSentiment}. Focus on practical implementation of the action plan.`;
    }

    chatInstance.current = ai.chats.create({
      model: getChatModel(),
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      },
    });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      if (!chatInstance.current) initChat();
      
      const response = await chatInstance.current!.sendMessage({ message: userMsg });
      
      const webSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((c: any) => c.web)
        .map((c: any) => ({ title: c.web.title, uri: c.web.uri })) || [];
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Research complete.", sources: webSources }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("authorization_required") || msg.includes("403") || msg.includes("not found") || msg.includes("permission")) {
        chatInstance.current = null;
        await openAiStudioKeySelector();
      }
      setMessages(prev => [...prev, {
        role: 'model',
        text: msg.includes("missing gemini api key")
          ? "Signal Terminal Error: Missing Gemini key. Set VITE_GEMINI_API_KEY in your environment."
          : "Signal Terminal Error: Connection reset. Please ensure authorization."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-24 md:right-8 z-[300]">
      {isOpen ? (
        <div className="bg-[#0c0c0c] w-[calc(100vw-48px)] sm:w-[320px] md:w-[360px] h-[480px] max-h-[80vh] rounded-[2rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300 relative border-b-4 border-b-[#FFC107]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur-xl relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFC107] rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Neural Intel</h3>
                <span className="text-[7px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Search className="w-2.5 h-2.5" /> Grounded by Google Search
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { chatInstance.current = null; setMessages([{ role: 'model', text: 'Reset complete. New link active.' }]); }} className="p-2 text-slate-500 hover:text-[#FFC107] transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#080808]/90 relative z-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-xl ${
                  msg.role === 'user' 
                  ? 'bg-[#FFC107] text-black font-bold rounded-tr-none' 
                  : 'bg-[#111] text-slate-300 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                       <p className="text-[7px] font-black uppercase text-[#FFC107] tracking-[0.2em]">Verified Sources</p>
                       <div className="space-y-1.5">
                         {msg.sources.slice(0, 2).map((s, si) => (
                           <a key={si} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-white truncate bg-white/[0.03] p-2 rounded-lg border border-white/5 hover:border-[#FFC107]/20 transition-all">
                             <ExternalLink className="w-3 h-3 flex-shrink-0" /> {s.title}
                           </a>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-[#111] p-3 rounded-2xl border border-white/5 rounded-tl-none flex items-center gap-2.5">
                   <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-bounce [animation-delay:0s]" />
                     <div className="w-1.5 h-1.5 bg-[#FFC107] rounded-full animate-bounce [animation-delay:150ms]" />
                   </div>
                   <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Querying Google Search...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-black border-t border-white/10 relative z-20">
            <div className="relative group">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Query market vectors via Search..." 
                className="w-full bg-[#080808] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-[10px] text-white focus:outline-none focus:border-[#FFC107]/30 placeholder:text-slate-800"
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="absolute right-1.5 top-1.5 p-2 bg-[#FFC107] rounded-lg text-black hover:scale-105 active:scale-95 disabled:bg-slate-900 disabled:text-slate-700 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-[#FFC107] text-black w-14 h-14 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 transition-all group flex items-center justify-center relative overflow-hidden ring-4 ring-black"
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-all" />
          <div className="relative flex flex-col items-center">
            <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform relative z-10" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
