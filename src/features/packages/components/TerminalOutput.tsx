"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useLanguage } from "@/hooks/useLanguage";

export const TerminalOutput = () => {
  const { t } = useLanguage();
  const [logs, setLogs]         = useState<string[]>([]);
  const [visible, setVisible]   = useState(false);
  const scrollRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;
    let mounted = true;

    const setup = async () => {
      try {
        unlisten = await listen<string>("winget-output", (e) => {
          if (mounted) {
            setLogs((p) => [...p, e.payload]);
            setVisible(true);
          }
        });
      } catch {}
    };

    setup();
    return () => { mounted = false; if (unlisten) unlisten(); };
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  if (!visible && logs.length === 0) return null;

  return (
    <div className="terminal-console-elite glass-panel">
      <div className="terminal-header">
        <div className="terminal-title">
          <TerminalIcon size={14} className="text-accent" />
          <span>{t("packages.terminal") || "System Output"}</span>
        </div>
        <div className="terminal-controls">
          <div className="control-dot red" />
          <div className="control-dot yellow" />
          <button
            className="terminal-close-btn"
            onClick={() => { setLogs([]); setVisible(false); }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="terminal-placeholder">Aguardando saída do processo...</div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="terminal-line">
              <span className="line-prefix">❯</span> {line}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .terminal-console-elite {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 500px;
          height: 320px;
          display: flex;
          flex-direction: column;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-accent);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), var(--accent-glow);
          border-radius: var(--r-lg);
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .terminal-header {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .terminal-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.5px;
        }

        .terminal-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          opacity: 0.5;
        }

        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }

        .terminal-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .terminal-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .terminal-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .terminal-placeholder {
          color: var(--text-muted);
          font-style: italic;
          opacity: 0.5;
        }

        .terminal-line {
          margin-bottom: 4px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .line-prefix {
          color: var(--accent);
          font-weight: 800;
          margin-right: 8px;
        }

        .text-accent { color: var(--accent); }

        .terminal-body::-webkit-scrollbar { width: 6px; }
        .terminal-body::-webkit-scrollbar-track { background: transparent; }
        .terminal-body::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
