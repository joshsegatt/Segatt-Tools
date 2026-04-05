"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Zap, Cpu, Database, Terminal, ChevronRight } from "lucide-react";
import { ChatInterface } from "@/features/ai/components/ChatInterface";

interface SystemContext {
  total_memory: number;
  used_memory: number;
  cpu_usage: number;
  top_processes: { name: string; cpu_usage: number; memory_mb: number }[];
}

interface Suggestion {
  tweak_id: string;
  reason: string;
  impact: string;
}

interface SmartDiagnostic {
  context: SystemContext;
  suggestions: Suggestion[];
}

export default function AIPage() {
  const [data, setData]           = useState<SmartDiagnostic | null>(null);
  const [isApplying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try { setData(await invoke("get_smart_diagnostic")); } catch {}
    };
    fetch();
    const i = setInterval(fetch, 3000);
    return () => clearInterval(i);
  }, []);

  const applyTweak = async (id: string) => {
    setApplying(id);
    try { await invoke("apply_tweak", { id }); } catch {}
    finally { setApplying(null); }
  };

  const ctx    = data?.context;
  const ramPct = ctx ? Math.round((ctx.used_memory / ctx.total_memory) * 100) : 0;
  const cpuPct = ctx ? Math.round(ctx.cpu_usage) : 0;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 52px)", overflow: "hidden" }}>
      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 1, borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        {[
          { label: "CPU", value: `${cpuPct}%`, pct: cpuPct, icon: <Zap size={12} /> },
          { label: "RAM", value: `${ramPct}%`, pct: ramPct, icon: <Database size={12} /> },
        ].map(({ label, value, pct, icon }) => (
          <div key={label} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderRight: "1px solid var(--border)" }}>
            <div style={{ color: "var(--accent)" }}>{icon}</div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{value}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--danger)" : "var(--accent)", borderRadius: 2, transition: "width 0.5s" }} />
              </div>
            </div>
          </div>
        ))}

        {/* Top processes */}
        <div style={{ padding: "10px 16px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Terminal size={10} /> Live Processes
          </div>
          {ctx?.top_processes.slice(0, 3).map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.name}</span>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", flexShrink: 0 }}>{p.cpu_usage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: "grid", gridTemplateColumns: data?.suggestions?.length ? "280px 1fr" : "1fr", flex: 1, overflow: "hidden" }}>
        {/* AI Suggestions panel */}
        {data?.suggestions && data.suggestions.length > 0 && (
          <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
              AI Recommendations
            </div>
            {data.suggestions.map((s, i) => (
              <div key={i} className="item-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "12px 14px", cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                    background: s.impact === "High" ? "rgba(248,81,73,0.1)" : "var(--accent-dim)",
                    color: s.impact === "High" ? "var(--danger)" : "var(--accent)"
                  }}>
                    {s.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.reason}</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%" }}
                  onClick={() => applyTweak(s.tweak_id)}
                  disabled={isApplying === s.tweak_id}
                >
                  {isApplying === s.tweak_id ? "Applying..." : <><ChevronRight size={12} />Optimize Now</>}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat */}
        <div style={{ overflow: "hidden" }}>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
