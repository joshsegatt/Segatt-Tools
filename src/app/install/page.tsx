"use client";

import React, { useState, useMemo, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Search,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  Globe,
  Code2,
  Gamepad2,
  Music,
  Wrench,
  MessageSquare,
  CheckCheck,
  X,
  Cpu,
  ShieldCheck,
  Box,
  Layers,
  Filter
} from "lucide-react";
import { APP_CATEGORIES, type AppEntry, type InstalledStatus } from "@/lib/app-categories";
import { TerminalOutput } from "@/features/packages/components/TerminalOutput";
import { PageHeader } from "@/components/ui/PageHeader";

// ─── Icon map ───────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Code2, Gamepad2, Music, Wrench, MessageSquare, Cpu,
};

type ViewMode = "install" | "uninstall" | "upgrade";
type Manager = "winget" | "choco";

// ─── Single app row ─────────────────────────────────────────
interface AppRowProps {
  app: AppEntry;
  isSelected: boolean;
  status: InstalledStatus;
  mode: ViewMode;
  onToggle: () => void;
  onAction: () => void;
}

const AppRow = ({ app, isSelected, status, mode, onToggle, onAction }: AppRowProps) => {
  const { t } = useLanguage();
  const isProcessing = status === "installing";
  const isDone = status === "installed";

  return (
    <div
      className={`item-row-elite ${isSelected ? "selected" : ""} ${isDone ? "done" : ""}`}
      onClick={!isProcessing ? onToggle : undefined}
    >
      <div className="item-checkbox-elite">
        {isSelected && <CheckCheck size={12} />}
      </div>

      <div className="item-main">
        <span className="item-name">{app.name}</span>
        {app.foss && <span className="foss-tag">FOSS</span>}
      </div>

      <div className="item-actions">
        {isProcessing ? (
          <Loader2 size={14} className="animate-spin text-accent" />
        ) : isDone ? (
          <span className="text-success text-xs font-bold">✓ {t("install.status_done")}</span>
        ) : (
          <button 
            className={`action-btn-lite ${mode === 'uninstall' ? 'danger' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAction(); }}
          >
            {mode === "uninstall" ? <Trash2 size={12} /> : mode === "upgrade" ? <RefreshCw size={12} /> : <Download size={12} />}
          </button>
        )}
      </div>

      <style jsx>{`
        .item-row-elite {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: var(--r-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.01);
        }

        .item-row-elite:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }

        .item-row-elite.selected {
          background: var(--accent-dim);
          border-color: var(--accent);
        }

        .item-checkbox-elite {
          width: 18px;
          height: 18px;
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          background: rgba(0, 0, 0, 0.2);
        }

        .selected .item-checkbox-elite {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .item-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-name {
          font-size: 13px;
          font-weight: 500;
        }

        .foss-tag {
          font-size: 9px;
          font-weight: 900;
          background: var(--success-dim);
          color: var(--success);
          padding: 1px 4px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }

        .action-btn-lite {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .action-btn-lite:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .action-btn-lite.danger:hover {
          background: var(--danger);
          border-color: var(--danger);
        }
      `}</style>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
export default function SoftwareHub() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<ViewMode>("install");
  const [manager, setManager] = useState<Manager>("winget");
  const [fossOnly, setFossOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusMap, setStatusMap] = useState<Record<string, InstalledStatus>>({});
  const [working, setWorking] = useState(false);

  // Toggle mode logic
  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode);
    setSelected(new Set());
  };

  const toggleApp = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const executeAction = async (id: string) => {
    setStatusMap(prev => ({ ...prev, [id]: "installing" }));
    try {
      if (mode === "install") {
        await invoke("install_package_stream", { packageId: id });
      } else if (mode === "uninstall") {
        // Placeholder for uninstall logic
        await new Promise(r => setTimeout(r, 1500));
      }
      setStatusMap(prev => ({ ...prev, [id]: "installed" }));
    } catch {
      setStatusMap(prev => ({ ...prev, [id]: "error" }));
    }
  };

  const executeSelected = async () => {
    if (selected.size === 0 || working) return;
    setWorking(true);
    for (const id of selected) {
      await executeAction(id);
    }
    setSelected(new Set());
    setWorking(false);
  };

  const filteredCategories = useMemo(() => {
    let base = APP_CATEGORIES;
    if (fossOnly) {
      base = base.map(cat => ({
        ...cat,
        apps: cat.apps.filter(a => a.foss)
      })).filter(cat => cat.apps.length > 0);
    }
    
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.map((cat) => ({
      ...cat,
      apps: cat.apps.filter(
        (app) => app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.apps.length > 0);
  }, [search, fossOnly]);

  return (
    <div className="software-hub fade-in">
      <PageHeader 
        title={mode === "install" ? t("nav.install") : mode === "uninstall" ? t("install.mode_uninstall") : t("install.mode_upgrade")} 
        description={t("install.subtitle")}
      >
        <div className="action-bar-elite">
          {/* Mode Switcher */}
          <div className="tab-pill-elite">
            <button 
              className={mode === "install" ? "active" : ""} 
              onClick={() => handleModeChange("install")}
            >
              {t("install.mode_install")}
            </button>
            <button 
              className={mode === "uninstall" ? "active" : ""} 
              onClick={() => handleModeChange("uninstall")}
            >
              {t("install.mode_uninstall")}
            </button>
            <button 
              className={mode === "upgrade" ? "active" : ""} 
              onClick={() => handleModeChange("upgrade")}
            >
              {t("install.mode_upgrade")}
            </button>
          </div>

          <div className="topbar-divider" />

          {/* Search */}
          <div className="search-wrap-elite">
            <Search size={14} className="search-icon" />
            <input
              className="search-input-elite"
              type="text"
              placeholder={t("install.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className={`elite-btn-${mode === 'uninstall' ? 'danger' : 'accent'}`}
            onClick={executeSelected}
            disabled={selected.size === 0 || working}
          >
            {working ? (
              <Loader2 size={14} className="animate-spin" />
            ) : mode === "uninstall" ? (
              <><Trash2 size={14} /> {t("install.uninstall_selected")}</>
            ) : mode === "upgrade" ? (
              <><RefreshCw size={14} /> {t("install.upgrade_all")}</>
            ) : (
              <><Download size={14} /> {t("install.install_selected")}</>
            )}
            {selected.size > 0 && <span className="badge-count-elite">{selected.size}</span>}
          </button>
        </div>
      </PageHeader>

      <div className="hub-controls-bar glass-panel">
        <div className="control-group">
          <Layers size={14} className="text-accent" />
          <span className="control-label">{t("install.pkg_manager")}:</span>
          <select 
            value={manager} 
            onChange={(e) => setManager(e.target.value as Manager)}
            className="elite-select"
          >
            <option value="winget">WinGet</option>
            <option value="choco">Chocolatey</option>
          </select>
        </div>

        <div className="control-group">
          <Filter size={14} className="text-accent" />
          <span className="control-label">{t("install.foss_only")}</span>
          <label className="toggle-switch small">
            <input type="checkbox" checked={fossOnly} onChange={() => setFossOnly(!fossOnly)} />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="flex-grow" />

        <div className="status-label">
          <ShieldCheck size={14} className="text-success" />
          <span>Verified Packages</span>
        </div>
      </div>

      <div className="software-grid">
        {filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? Package;
          return (
            <div key={cat.key} className="hub-category glass-panel">
              <div className="hub-category-header">
                <Icon size={16} className="text-accent" />
                <h3>{cat.label}</h3>
              </div>
              <div className="hub-apps-list">
                {cat.apps.map((app) => (
                  <AppRow
                    key={app.id}
                    app={app}
                    mode={mode}
                    isSelected={selected.has(app.id)}
                    status={statusMap[app.id] ?? "not-installed"}
                    onToggle={() => toggleApp(app.id)}
                    onAction={() => executeAction(app.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TerminalOutput />

      <style jsx>{`
        .software-hub {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 80px;
        }

        .hub-controls-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 20px;
          border-radius: var(--r-md);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .elite-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          outline: none;
        }

        .status-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .software-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .hub-category {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .hub-category-header {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.02);
        }

        .hub-category-header h3 {
          font-size: 14px;
          font-weight: 700;
        }

        .hub-apps-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toggle-switch.small {
          width: 32px;
          height: 18px;
        }

        .toggle-switch.small .toggle-slider:before {
          height: 14px;
          width: 14px;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(14px);
        }

        .tab-pill-elite {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
        }

        .tab-pill-elite button {
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .tab-pill-elite button.active {
          background: var(--accent);
          color: white;
          box-shadow: var(--accent-glow);
        }

        .flex-grow { flex-grow: 1; }
      `}</style>
    </div>
  );
}

function Package({ size, className }: { size: number, className: string }) {
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
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}
