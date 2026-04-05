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
      <header className="mb-16">
        <div className="flex items-center gap-2 text-accent mb-4">
          <Zap size={18} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Módulo de Controle Central</span>
        </div>
        <h1 className="hero-title">
          Otimização <span className="text-accent">Elite</span> para<br />
          seu Sistema Windows.
        </h1>
        <p className="hero-description">
          Sinta a diferença de um sistema limpo, rápido e seguro. O Segatt Tools utiliza IA local para transformar seu PC em uma máquina de alto desempenho.
        </p>
        <div className="flex gap-4">
          <button className="button-primary flex items-center gap-2">
            Iniciar Diagnóstico <ArrowRight size={18} />
          </button>
          <button className="glass px-6 py-3 rounded-md text-sm font-semibold hover:bg-white/10 transition-all">
            Ver Tweaks
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-xl hover:translate-y-[-4px] transition-all cursor-pointer">
          <Shield className="text-accent mb-6" size={32} />
          <h3 className="text-lg font-bold mb-2 font-display">Privacidade Total</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Bloqueie telemetria, rastreadores e serviços desnecessários que consomem seus dados.
          </p>
        </div>

        <div className="glass p-8 rounded-xl hover:translate-y-[-4px] transition-all cursor-pointer border-accent/20">
          <Activity className="text-accent mb-6" size={32} />
          <h3 className="text-lg font-bold mb-2 font-display">Turbo Performance</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Otimize o uso de CPU e RAM para jogos e trabalho pesado com um único clique.
          </p>
        </div>

        <div className="glass p-8 rounded-xl hover:translate-y-[-4px] transition-all cursor-pointer">
          <Cpu className="text-accent mb-6" size={32} />
          <h3 className="text-lg font-bold mb-2 font-display">IA Local</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Diagnósticos inteligentes processados localmente. Sem APIs, sem custos, sem rastros.
          </p>
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-soft flex justify-between items-center text-xs text-text-muted">
        <p>© 2026 Segatt Tools. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <span className="flex items-center gap-1"><Shield size={12} /> Proteção Ativa</span>
          <span className="flex items-center gap-1"><Cpu size={12} /> IA Offline</span>
        </div>
      </footer>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .text-accent { color: var(--accent-primary); }
      `}</style>
    </div>
  );
}
