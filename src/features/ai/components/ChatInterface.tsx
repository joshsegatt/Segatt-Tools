"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Send, Bot, User, Loader2, Cpu } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatInterface = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const scrollRef                = useRef<HTMLDivElement>(null);

  // Initialize with localized greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: t("ai.greeting") || (language === "pt" ? "Olá! Sou a Inteligência da Segatt Tools. Como posso ajudar?" : "Hello! I am Segatt Tools Intelligence. How can I help?")
      }]);
    }
  }, [language]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setMessages((p) => [...p, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const response: string = await invoke("chat_with_segatt_ai", { 
        message: msg,
        language: language 
      });
      setMessages((p) => [...p, { role: "assistant", content: response }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: t("common.error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-base)" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ background: "var(--accent-dim)", borderRadius: 6, padding: 6, color: "var(--accent)" }}>
          <Cpu size={16} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Segatt AI</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--success)", fontWeight: 600 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)" }} />
            {t("ai.local_notice_short") || "Local Processing"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 8, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <Bot size={13} style={{ color: "var(--accent)" }} />
              </div>
            )}
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                fontSize: 13,
                lineHeight: 1.5,
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-surface)",
                color: msg.role === "user" ? "white" : "var(--text-secondary)",
                border: msg.role === "user" ? "none" : "1px solid var(--border)",
                whiteSpace: "pre-wrap"
              }}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg-surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <User size={13} style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-muted)", fontSize: 12 }}>
            <Loader2 size={13} className="animate-spin" style={{ color: "var(--accent)" }} />
            {t("ai.analyzing") || "Analyzing..."}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)", flexShrink: 0 }}>
        <form onSubmit={send} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ai.placeholder")}
            disabled={loading}
            style={{
              flex: 1, padding: "8px 14px", borderRadius: 6,
              background: "var(--bg-base)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: 13, outline: "none",
            }}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn btn-primary btn-icon"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
          {t("ai.local_notice")}
        </p>
      </div>
    </div>
  );
};
