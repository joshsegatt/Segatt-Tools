"use client";

import React from "react";
import { 
  Zap, 
  Shield, 
  Cpu, 
  Activity,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="fade-in">
      <header className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-label">Módulo de Controle Central</span>
        </div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', lineHeight: '1.1' }}>
          Otimização <span className="text-accent">Elite</span> para<br />
          seu Sistema Windows.
        </h1>
        <p className="hero-description">
          Sinta a diferença de um sistema limpo, rápido e seguro. O Segatt Tools utiliza IA local para transformar seu PC em uma máquina de alto desempenho.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Iniciar Diagnóstico <ArrowRight size={18} />
          </button>
          <button className="glass" style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
            Ver Tweaks
          </button>
        </div>
      </header>

      <section className="grid-auto">
        <div className="card-elite">
          <Shield className="text-accent" size={32} style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>Privacidade Total</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Bloqueie telemetria, rastreadores e serviços desnecessários que consomem seus dados.
          </p>
        </div>

        <div className="card-elite" style={{ borderColor: 'var(--accent-primary)' }}>
          <Activity className="text-accent" size={32} style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>Turbo Performance</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Otimize o uso de CPU e RAM para jogos e trabalho pesado com um único clique.
          </p>
        </div>

        <div className="card-elite">
          <Cpu className="text-accent" size={32} style={{ marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>IA Local</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Diagnósticos inteligentes processados localmente. Sem APIs, sem custos, sem rastros.
          </p>
        </div>
      </section>

      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <p>© 2026 Segatt Tools. Todos os direitos reservados.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> Proteção Ativa</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12} /> IA Offline</span>
        </div>
      </footer>
    </div>
  );
}
