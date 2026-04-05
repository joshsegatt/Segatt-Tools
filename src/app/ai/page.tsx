"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Zap, 
  Cpu, 
  Database, 
  Terminal,
  ChevronRight,
  ShieldCheck
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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '120px' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '10px' }}>
            <Zap size={14} />
            <span>Diagnóstico Adaptativo</span>
          </div>
          <h1 className="hero-title" style={{ marginBottom: 0 }}>Segatt AI Command</h1>
          <p className="hero-description" style={{ marginBottom: 0 }}>
            Sua central de inteligência local. O Segatt analisa seu hardware e sugere otimizações em tempo real.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Stats Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div className="card-elite" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Cpu size={20} style={{ color: 'var(--accent-primary)' }} />
                <div>
                   <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{context?.cpu_usage.toFixed(1)}%</span>
                   <p className="text-label" style={{ fontSize: '9px', marginTop: '4px' }}>CARGA CPU</p>
                </div>
             </div>
             <div className="card-elite" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Database size={20} style={{ color: 'var(--accent-primary)' }} />
                <div>
                   <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{ramPercentage.toFixed(1)}%</span>
                   <p className="text-label" style={{ fontSize: '9px', marginTop: '4px' }}>RAM EM USO</p>
                </div>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <h3 className="text-label" style={{ paddingLeft: '8px' }}>Ações Recomendadas</h3>
             
             {data?.suggestions.map((s, i) => (
                <div key={i} className="card-elite" style={{ borderColor: 'rgba(100, 150, 255, 0.2)', backgroundColor: 'rgba(100, 150, 255, 0.05)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: '800', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        background: s.impact === 'High' ? 'rgba(255, 50, 50, 0.1)' : 'rgba(100, 150, 255, 0.1)',
                        color: s.impact === 'High' ? 'oklch(60% 0.15 20)' : 'var(--accent-primary)'
                      }}>
                         IMPACTO {s.impact.toUpperCase()}
                      </span>
                      <ShieldCheck size={14} style={{ opacity: 0.3 }} />
                   </div>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>{s.reason}</p>
                   <button 
                     onClick={() => handleApplyTweak(s.tweak_id)}
                     className="button-primary"
                     style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
                   >
                     {isApplying === s.tweak_id ? "OTIMIZANDO..." : "OTIMIZAR AGORA"}
                   </button>
                </div>
             ))}
          </div>

          <div className="card-elite">
            <h4 className="text-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Terminal size={12} /> Carga em Tempo Real
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {context?.top_processes.slice(0, 3).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '60px', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px' }}>
                       <div style={{ width: `${p.cpu_usage}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>{p.cpu_usage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div style={{ minWidth: '400px' }}>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
