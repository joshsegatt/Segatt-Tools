"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, XCircle, Loader2 } from "lucide-react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export const TerminalOutput = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    let isMounted = true;

    // Auditoria: Garantir que o unlisten seja chamado corretamente no Tauri v2
    const setupListener = async () => {
      try {
        const handler = await listen<string>("winget-output", (event) => {
          if (isMounted) {
            setLogs((prev) => [...prev, event.payload]);
            setIsVisible(true);
          }
        });
        unlisten = handler;
      } catch (err) {
        console.error("Falha ao ouvir eventos do WinGet:", err);
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unlisten) unlisten();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isVisible && logs.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 w-[450px] glass rounded-xl shadow-2xl overflow-hidden border border-accent/30 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-soft">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Console do Sistema</span>
        </div>
        <button 
          onClick={() => { setLogs([]); setIsVisible(false); }}
          className="text-text-muted hover:text-white transition-colors"
        >
          <XCircle size={14} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="h-64 p-4 font-mono text-[11px] overflow-y-auto bg-black/40 text-text-secondary leading-relaxed scrollbar-thin"
      >
        {logs.map((log, i) => (
          <div key={i} className="mb-1 break-words">
            <span className="text-accent-primary mr-2">➜</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
