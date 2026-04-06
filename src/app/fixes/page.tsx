"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  Wifi, 
  Database, 
  Settings, 
  Layout, 
  Terminal,
  Activity,
  HardDrive,
  Globe,
  Settings2,
  FileCode,
  ShieldCheck,
  Search,
  ExternalLink
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function FixesPage() {
  const { t } = useLanguage();
  const [running, setRunning] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runFix = async (id: string, command: string) => {
    if (running) return;
    setRunning(id);
    
    // Clear logs and show start
    const startTime = new Date().toLocaleTimeString();
    setLogs([`[${startTime}] Iniciando: ${id}...`]);
    
    try {
      // Listen for log events
      const unlisten = await listen<string>("system-fix-log", (event) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${event.payload}`, ...prev]);
      });

      // Execute the real fix
      await invoke("run_system_fix", { id });

      // The Rust side will emit the logs and "CONCLUÍDO" event
    } catch (err) {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ERRO CRÍTICO: ${err}`, ...prev]);
      setRunning(null);
    } finally {
      // We don't null running here because the streaming handles the completion visual
      setTimeout(() => setRunning(null), 1000);
    }
  };

  const openLegacyPanel = async (cmd: string) => {
    try {
      await invoke("open_legacy_panel", { panel: cmd });
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Abrindo Painel: ${cmd}`, ...prev]);
    } catch (err) {
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Erro ao abrir: ${err}`, ...prev]);
    }
  };

  const LEGACY_PANELS = [
    { name: "Computer Management", cmd: "compmgmt.msc", icon: Layout },
    { name: "Control Panel", cmd: "control", icon: Settings },
    { name: "Network Connections", cmd: "ncpa.cpl", icon: Wifi },
    { name: "Power Options", cmd: "powercfg.cpl", icon: Activity },
    { name: "Device Manager", cmd: "devmgmt.msc", icon: Database },
    { name: "Disk Management", cmd: "diskmgmt.msc", icon: HardDrive },
    { name: "Services", cmd: "services.msc", icon: Settings2 },
    { name: "System Properties", cmd: "sysdm.cpl", icon: Search },
  ];

  return (
    <div className="fade-in elite-fixes">
      <PageHeader 
        title={t("fixes.title")} 
        description={t("fixes.subtitle")}
        compact={true}
      />

      <div className="fixes-grid">
        {/* Core System Repair */}
        <section className="fixes-section glass-panel">
          <div className="section-header">
            <ShieldAlert size={18} className="text-accent" />
            <h3>Integridade do Sistema</h3>
          </div>
          <div className="tools-list">
            <button 
              className={`tool-card-elite ${running === 'sfc' ? 'running' : ''}`}
              onClick={() => runFix('sfc', 'sfc /scannow')}
            >
              <Terminal size={20} />
              <div className="tool-info">
                <span className="tool-name">{t("fixes.sfc_scan")}</span>
                <span className="tool-desc">{t("fixes.sfc_desc")}</span>
              </div>
              {running === 'sfc' && <div className="loader-ring" />}
            </button>
            
            <button 
              className={`tool-card-elite ${running === 'dism' ? 'running' : ''}`}
              onClick={() => runFix('dism', 'DISM /Online /Cleanup-Image /RestoreHealth')}
            >
              <Database size={20} />
              <div className="tool-info">
                <span className="tool-name">{t("fixes.dism_repair")}</span>
                <span className="tool-desc">{t("fixes.dism_desc")}</span>
              </div>
              {running === 'dism' && <div className="loader-ring" />}
            </button>
          </div>
        </section>

        {/* Network & Components */}
        <section className="fixes-section glass-panel">
          <div className="section-header">
            <Globe size={18} className="text-accent" />
            <h3>Rede e Componentes</h3>
          </div>
          <div className="tools-list">
            <button 
              className={`tool-card-elite ${running === 'net' ? 'running' : ''}`}
              onClick={() => runFix('net', 'netsh winsock reset')}
            >
              <Wifi size={20} />
              <div className="tool-info">
                <span className="tool-name">{t("fixes.net_reset")}</span>
                <span className="tool-desc">Reseta stack TCP/IP e DNS.</span>
              </div>
            </button>

            <button 
              className={`tool-card-elite ${running === 'update' ? 'running' : ''}`}
              onClick={() => runFix('update', 'bitsadmin /reset')}
            >
              <RefreshCw size={20} />
              <div className="tool-info">
                <span className="tool-name">{t("fixes.update_reset")}</span>
                <span className="tool-desc">Limpa fila do Windows Update.</span>
              </div>
            </button>
          </div>
        </section>

        {/* Maintenance & Cache */}
        <section className="fixes-section glass-panel">
          <div className="section-header">
            <HardDrive size={18} className="text-accent" />
            <h3>Manutenção e Cache</h3>
          </div>
          <div className="tools-list">
            <button 
              className={`tool-card-elite ${running === 'cache' ? 'running' : ''}`}
              onClick={() => runFix('cache', 'ie4uinit.exe -show')}
            >
              <FileCode size={20} />
              <div className="tool-info">
                <span className="tool-name">{t("fixes.clear_cache")}</span>
                <span className="tool-desc">Reseta ícones e cache de fontes.</span>
              </div>
            </button>
          </div>
        </section>

        {/* Legacy Panels Grid */}
        <section className="fixes-section legacy-grid-section">
          <div className="section-header">
            <Layout size={18} className="text-accent" />
            <h3>{t("fixes.legacy_panels")}</h3>
          </div>
          <div className="legacy-panels-grid">
            {LEGACY_PANELS.map((panel) => (
              <button 
                key={panel.cmd} 
                className="legacy-item glass-panel"
                onClick={() => openLegacyPanel(panel.cmd)}
              >
                <panel.icon size={16} />
                <span>{panel.name}</span>
                <ExternalLink size={12} className="external-icon" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Terminal Log Output */}
      <div className="fixes-log-container glass-panel">
        <div className="log-header">
          <Terminal size={14} />
          <span>{t("fixes.terminal")}</span>
        </div>
        <div className="log-content">
          {logs.length === 0 ? (
            <span className="text-muted">Aguardando comando...</span>
          ) : (
            logs.map((log, i) => <div key={i} className="log-line">{log}</div>)
          )}
        </div>
      </div>

      <style jsx>{`
        .elite-fixes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 20px;
        }

        .fixes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 12px;
        }

        .fixes-section {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 12px;
        }

        .section-header h3 {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .tools-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tool-card-elite {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--r-md);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          position: relative;
        }

        .tool-card-elite:hover {
          background: var(--bg-hover);
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .tool-card-elite.running {
          border-color: var(--accent);
          background: var(--accent-dim);
          pointer-events: none;
        }

        .tool-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .tool-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tool-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .legacy-grid-section {
          grid-column: 1 / -1;
        }

        .legacy-panels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .legacy-item {
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          position: relative;
        }

        .legacy-item:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        .external-icon {
          margin-left: auto;
          opacity: 0.5;
        }

        .fixes-log-container {
          padding: 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--r-md);
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .log-content {
          font-family: var(--font-mono);
          font-size: 11px;
          height: 90px;
          overflow-y: auto;
          display: flex;
          flex-direction: column-reverse;
          gap: 4px;
          padding-right: 8px;
        }

        .log-line {
          color: var(--text-secondary);
        }

        .loader-ring {
          position: absolute;
          right: 16px;
          width: 16px;
          height: 16px;
          border: 2px solid var(--accent-dim);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
