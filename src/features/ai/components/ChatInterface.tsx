"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente de elite do Segatt Tools. Como posso ajudar com a otimização do seu sistema hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Simulação de delay de pensamento de IA
      const response: string = await invoke("chat_with_segatt_ai", { message: currentInput });
      
      const assistantMsg: Message = { 
        role: "assistant", 
        content: response, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-3xl border border-accent-primary/20 overflow-hidden shadow-2xl relative">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-20 bg-accent-primary/10 blur-[80px] -z-10" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-soft bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-primary rounded-xl text-white shadow-lg shadow-accent-primary/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Segatt AI</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-accent-primary font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
              Processamento Local
            </div>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-text-muted">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === "user" ? "bg-white/10 text-text-secondary" : "bg-accent-primary/20 text-accent-primary border border-accent-primary/20"}
              `}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`
                p-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === "user" ? "bg-accent-primary text-white font-medium rounded-tr-none" : "glass text-text-secondary rounded-tl-none border border-accent-primary/10"}
              `}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[85%] items-center">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-accent-primary" />
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
                Segatt está pensando...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 border-t border-soft">
        <form onSubmit={handleSend} className="relative group">
          <input 
            type="text" 
            placeholder="Pergunte qualquer coisa sobre seu sistema..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white/5 border border-soft rounded-2xl px-6 py-4 outline-none focus:border-accent-primary focus:bg-white/10 transition-all font-medium text-sm pr-14 group-hover:bg-white/10 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent-primary text-white rounded-xl shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="mt-3 text-[10px] text-center text-text-muted font-medium">
          Privacidade absoluta. Todo o processamento ocorre localmente em seu hardware.
        </p>
      </div>
    </div>
  );
};
