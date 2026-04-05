"use client";

import React, { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Search,
  Download,
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
} from "lucide-react";
import { APP_CATEGORIES, type AppEntry, type InstalledStatus } from "@/lib/app-categories";
import { TerminalOutput } from "@/features/packages/components/TerminalOutput";

// ─── Icon map ───────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Code2, Gamepad2, Music, Wrench, MessageSquare, Cpu,
};

// ─── Single app row ─────────────────────────────────────────
interface AppRowProps {
  app: AppEntry;
  isSelected: boolean;
  status: InstalledStatus;
  onToggle: () => void;
  onInstall: () => void;
}

const AppRow = ({ app, isSelected, status, onToggle, onInstall }: AppRowProps) => {
  const { t } = useLanguage();
  const isInstalling = status === "installing";
  const isInstalled  = status === "installed";

  return (
    <div
      className={`item-row ${isSelected ? "selected" : ""}`}
      onClick={!isInstalling ? onToggle : undefined}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && onToggle()}
    >
      <div className="item-checkbox" aria-hidden="true">
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <span className="item-name" title={app.description}>
        {app.name}
      </span>

      <div className="tooltip-wrap" onClick={(e) => e.stopPropagation()}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <div className="tooltip-box">{app.description}</div>
      </div>

      <div className="item-action" onClick={(e) => { e.stopPropagation(); onInstall(); }}>
        {isInstalling ? (
          <Loader2 size={13} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : isInstalled ? (
          <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ {t("install.status_done")}</span>
        ) : (
          <button className="btn btn-primary btn-sm" aria-label={`Install ${app.name}`}>
            <Download size={11} /> {t("install.install_btn")}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
export default function InstallPage() {
  const { t } = useLanguage();
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [statusMap, setStatusMap] = useState<Record<string, InstalledStatus>>({});
  const [search, setSearch]       = useState("");
  const [isInstalling, setIsInstalling] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const installSingle = async (id: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: "installing" }));
    try {
      await invoke("install_package_stream", { packageId: id });
      setStatusMap((prev) => ({ ...prev, [id]: "installed" }));
    } catch {
      setStatusMap((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const installSelected = async () => {
    if (selected.size === 0 || isInstalling) return;
    setIsInstalling(true);
    for (const id of selected) {
      await installSingle(id);
    }
    setSelected(new Set());
    setIsInstalling(false);
  };

  const selectAll = () => {
    const allIds = APP_CATEGORIES.flatMap((c) => c.apps.map((a) => a.id));
    setSelected(new Set(allIds));
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return APP_CATEGORIES;
    const q = search.toLowerCase();
    return APP_CATEGORIES.map((cat) => ({
      ...cat,
      apps: cat.apps.filter(
        (app) => app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.apps.length > 0);
  }, [search]);

  return (
    <div className="checklist-page fade-in">
      <div className="action-bar">
        <div className="search-wrap" style={{ width: 260 }}>
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder={t("install.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, color: "var(--text-muted)" }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="topbar-divider" />

        <div className="action-bar-section">
          <button className="btn btn-ghost btn-sm" onClick={selectAll}>
            <CheckCheck size={13} /> {t("tweaks.select_all")}
          </button>
          {selected.size > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              <X size={13} /> {t("tweaks.clear_btn")}
            </button>
          )}
        </div>

        <div className="action-bar-spacer" />

        <button
          className="btn btn-primary"
          onClick={installSelected}
          disabled={selected.size === 0 || isInstalling}
        >
          {isInstalling ? (
            <><Loader2 size={14} className="animate-spin" /> ...</>
          ) : (
            <>
              <Download size={14} />
              {t("install.install_selected")}
              {selected.size > 0 && <span className="badge-count">{selected.size}</span>}
            </>
          )}
        </button>
      </div>

      <div className="checklist-grid">
        {filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? Wrench;
          const catSelected = cat.apps.filter((a) => selected.has(a.id)).length;

          return (
            <div key={cat.key} className="category-col">
              <div className="category-header">
                <div className="category-title">
                  <Icon size={13} />
                  {cat.label}
                </div>
                {catSelected > 0 && <span className="badge-count">{catSelected}</span>}
              </div>

              {cat.apps.map((app) => (
                <AppRow
                  key={app.id}
                  app={app}
                  isSelected={selected.has(app.id)}
                  status={statusMap[app.id] ?? "not-installed"}
                  onToggle={() => toggle(app.id)}
                  onInstall={() => installSingle(app.id)}
                />
              ))}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <div className="empty-state-icon"><Search size={40} /></div>
            <div className="empty-state-title">{t("install.no_apps")} "{search}"</div>
          </div>
        )}
      </div>

      <TerminalOutput />
    </div>
  );
}
