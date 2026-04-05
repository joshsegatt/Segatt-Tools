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
    <div className="glass fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '600px', 
      borderRadius: 'var(--radius-2xl)', 
      overflow: 'hidden', 
      position: 'relative',
      boxShadow: '0 20px 80px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: 'var(--radius-md)', color: 'white' }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Segatt AI</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.8 }} />
              Processamento Local
            </div>
          </div>
        </div>
        <Sparkles size={18} style={{ color: 'var(--text-muted)' }} />
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(100, 150, 255, 0.15)',
                color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--accent-primary)'
              }}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{ 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-lg)', 
                fontSize: '0.85rem', 
                lineHeight: '1.6',
                background: msg.role === "user" ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                color: msg.role === "user" ? 'white' : 'var(--text-secondary)',
                border: msg.role === "user" ? 'none' : '1px solid var(--border-soft)',
                borderTopRightRadius: msg.role === 'user' ? '0' : 'var(--radius-lg)',
                borderTopLeftRadius: msg.role === 'assistant' ? '0' : 'var(--radius-lg)',
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.6 }}>
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Segatt está pensando...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-soft)' }}>
        <form onSubmit={handleSend} style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Pergunte sobre seu sistema..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ 
              width: '100%', padding: '16px 60px 16px 24px', borderRadius: 'var(--radius-xl)', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)', color: 'white', outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            style={{ 
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', opacity: !input.trim() ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
          IA Local. Sua conversa nunca sai deste computador.
        </p>
      </div>
    </div>
  );
};
