"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export const TerminalOutput = () => {
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
    <div className="terminal-console">
      <div className="terminal-header">
        <div className="terminal-title">
          <TerminalIcon size={12} />
          WinGet Output
        </div>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => { setLogs([]); setVisible(false); }}
          aria-label="Close terminal"
        >
          <X size={13} />
        </button>
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {logs.map((line, i) => (
          <div key={i} className="terminal-line">{line}</div>
        ))}
      </div>
    </div>
  );
};
