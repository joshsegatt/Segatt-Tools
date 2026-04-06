"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Cpu, 
  Box, 
  Terminal,
  Server,
  CloudOff,
  Clock,
  History,
  ToggleLeft as Toggle,
  CheckCircle2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/useLanguage";

export default function ConfigPage() {
  const { t } = useLanguage();
  const [activePreset, setActivePreset] = useState("default");
  
  const FEATURES = [
    { id: "wsl", name: "Windows Subsystem for Linux (WSL)", icon: Terminal },
    { id: "hyperv", name: "Hyper-V Virtualization", icon: Cpu },
    { id: "sandbox", name: "Windows Sandbox", icon: Box },
    { id: "containers", name: "Containers", icon: Server },
    { id: "vmp", name: "Virtual Machine Platform", icon: (props: any) => <Database {...props} /> },
    { id: "tftp", name: "TFTP Client", icon: History },
  ];

  return (
    <div className="fade-in elite-config">
      <PageHeader 
        title={t("management.title")} 
        description={t("management.subtitle")}
      />

      {/* Windows Update Presets */}
      <section className="config-section">
        <div className="section-title">
          <RefreshCw size={18} className="text-accent" />
          <h2>{t("management.updates_title")}</h2>
        </div>
        <p className="section-desc">{t("management.updates_desc")}</p>
        
        <div className="preset-grid">
          <div 
            className={`preset-card glass-panel ${activePreset === "default" ? "active" : ""}`}
            onClick={() => setActivePreset("default")}
          >
            <div className="preset-header">
              <ShieldCheck size={24} className="text-accent" />
              <h3>{t("management.update_default")}</h3>
            </div>
            <p>Configuração padrão da Microsoft com atualizações automáticas.</p>
            <button className="elite-btn-outline">Restaurar Padrão</button>
          </div>

          <div 
            className={`preset-card glass-panel ${activePreset === "security" ? "active" : ""}`}
            onClick={() => setActivePreset("security")}
          >
            <div className="preset-header">
              <Clock size={24} className="text-accent" />
              <h3>{t("management.update_security")}</h3>
            </div>
            <p>Apenas correções de segurança. Adia novas funções por 365 dias.</p>
            <button className="elite-btn-accent">Aplicar Balanced</button>
          </div>

          <div 
            className={`preset-card glass-panel ${activePreset === "disable" ? "danger-active" : ""}`}
            onClick={() => setActivePreset("disable")}
          >
            <div className="preset-header">
              <CloudOff size={24} className="text-danger" />
              <h3>{t("management.update_disable")}</h3>
            </div>
            <p>Interrompe todas as atualizações. Recomendado apenas para isolados.</p>
            <div className="badge-danger">NÃO RECOMENDADO</div>
            <button className="elite-btn-danger">Bloquear Tudo</button>
          </div>
        </div>
      </section>

      {/* Windows Features Toggle */}
      <section className="config-section">
        <div className="section-title">
          <Box size={18} className="text-accent" />
          <h2>{t("management.features_title")}</h2>
        </div>
        <p className="section-desc">{t("management.features_desc")}</p>
        
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="feature-item glass-panel">
              <div className="feature-icon">
                <feature.icon size={20} />
              </div>
              <div className="feature-info">
                <span className="feature-name">{feature.name}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
        
        <div className="action-bar-elite" style={{ marginTop: 20 }}>
          <button className="elite-btn-accent large">
            <RefreshCw size={18} />
            Aplicar Alterações e Reiniciar
          </button>
        </div>
      </section>

      <style jsx>{`
        .elite-config {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-bottom: 60px;
        }

        .config-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .section-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .preset-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .preset-card:hover {
          border-color: var(--accent);
          background: var(--bg-hover);
        }

        .preset-card.active {
          border-color: var(--accent);
          background: var(--accent-dim);
          box-shadow: var(--accent-glow);
        }

        .preset-card.danger-active {
          border-color: var(--danger);
          background: rgba(239, 68, 68, 0.05);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
        }

        .preset-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .preset-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .preset-card p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          flex-grow: 1;
        }

        .badge-danger {
          font-size: 10px;
          font-weight: 900;
          color: var(--danger);
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
          width: fit-content;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 12px;
        }

        .feature-item {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .feature-info {
          flex: 1;
        }

        .feature-name {
          font-size: 14px;
          font-weight: 600;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .3s;
          border-radius: 24px;
          border: 1px solid var(--border-subtle);
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--accent);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .large {
          padding: 16px 32px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}

function Database({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
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
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
      <path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  );
}
