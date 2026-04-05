"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Activity, 
  Cpu, 
  Database, 
  TrendingUp, 
  HelpCircle,
  Zap,
  Terminal,
  ChevronRight,
  ShieldCheck,
  ZapOff
} from "lucide-react";
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
  const [data, setData] = useState<SmartDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const fetchDiagnostic = async () => {
    try {
      const res: SmartDiagnostic = await invoke("get_smart_diagnostic");
      setData(res);
    } catch (err) {
      console.error("Diagnostic fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
    const interval = setInterval(fetchDiagnostic, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyTweak = async (id: string) => {
    setIsApplying(id);
    try {
      await invoke("apply_tweak", { id });
      // Simulate confirmation
      alert("Ajuste aplicado com sucesso!");
    } catch (err: any) {
      alert(`Erro: ${err}`);
    } finally {
      setIsApplying(null);
    }
  };

  const context = data?.context;
  const ramPercentage = context ? (context.used_memory / context.total_memory) * 100 : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.2em] text-[10px] font-bold">
            <Zap size={14} />
            <span>Diagnóstico Adaptativo</span>
          </div>
          <h1 className="hero-title mb-0">Segatt AI Command</h1>
          <p className="text-text-secondary max-w-lg">
            Sua central de inteligência local. O Segatt analisa seu hardware e sugere otimizações em tempo real.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Stats & Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          {/* CPU & RAM Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="glass p-4 rounded-2xl border border-soft flex flex-col gap-3">
                <Cpu size={20} className="text-accent-primary" />
                <div className="flex flex-col">
                   <span className="text-2xl font-bold font-display">{context?.cpu_usage.toFixed(1)}%</span>
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">CPU</span>
                </div>
             </div>
             <div className="glass p-4 rounded-2xl border border-soft flex flex-col gap-3">
                <Database size={20} className="text-accent-primary" />
                <div className="flex flex-col">
                   <span className="text-2xl font-bold font-display">{ramPercentage.toFixed(1)}%</span>
                   <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">RAM</span>
                </div>
             </div>
          </div>

          {/* AI Critical Suggestions */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2 px-2">
                <Sparkles size={16} className="text-accent-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Ações Recomendadas</h3>
             </div>
             
             {data?.suggestions.map((s, i) => (
                <div key={i} className="glass p-5 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 hover:bg-accent-primary/10 transition-all group animate-in slide-in-from-left-4">
                   <div className="flex justify-between items-start mb-3">
                      <div className={`
                        px-2 py-0.5 rounded text-[8px] font-bold uppercase
                        ${s.impact === "High" ? "bg-accent-error/20 text-accent-error" : "bg-accent-primary/20 text-accent-primary"}
                      `}>
                         Impacto {s.impact}
                      </div>
                      <ShieldCheck size={14} className="text-accent-primary opacity-50" />
                   </div>
                   <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      {s.reason}
                   </p>
                   <button 
                     onClick={() => handleApplyTweak(s.tweak_id)}
                     disabled={isApplying === s.tweak_id}
                     className="w-full py-2 bg-accent-primary text-white text-[10px] font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(100,150,255,0.3)] disabled:opacity-50"
                   >
                      {isApplying === s.tweak_id ? "APLICANDO..." : "OTIMIZAR AGORA"}
                      <ChevronRight size={12} />
                   </button>
                </div>
             ))}
          </div>

          {/* Top Processes (Compact) */}
          <div className="glass p-5 rounded-2xl border border-soft">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
               <Terminal size={12} /> Carga em Tempo Real
            </h4>
            <div className="space-y-3">
              {context?.top_processes.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-secondary truncate max-w-[100px]">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-accent-primary" style={{ width: `${p.cpu_usage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">{p.cpu_usage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="lg:col-span-8">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
