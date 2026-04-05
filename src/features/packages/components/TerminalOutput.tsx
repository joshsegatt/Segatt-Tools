"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, XCircle } from "lucide-react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export const TerminalOutput = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    let isMounted = true;

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
    <div 
      className="glass fade-in" 
      style={{ 
        position: 'fixed', 
        bottom: '32px', 
        right: '32px', 
        width: '450px', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden', 
        zIndex: 1000,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalIcon size={14} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Log de Instalação</span>
        </div>
        <button 
          onClick={() => { setLogs([]); setIsVisible(false); }}
          style={{ opacity: 0.5 }}
        >
          <XCircle size={14} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        style={{ 
          height: '240px', 
          padding: '16px', 
          fontFamily: 'monospace', 
          fontSize: '11px', 
          overflowY: 'auto', 
          background: 'rgba(0,0,0,0.4)', 
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}
      >
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '4px', wordBreak: 'break-all' }}>
            <span style={{ color: 'var(--accent-primary)', marginRight: '8px' }}>➜</span>
            {log}
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Aguardando saída do WinGet...</div>}
      </div>
    </div>
  );
};
