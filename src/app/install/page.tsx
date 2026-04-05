"use client";

import React, { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Search,
  Download,
  Trash2,
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
      {/* Checkbox */}
      <div className="item-checkbox" aria-hidden="true">
        {isSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Name */}
      <span className="item-name" title={app.description}>
        {app.name}
      </span>

      {/* Tooltip */}
      <div className="tooltip-wrap" onClick={(e) => e.stopPropagation()}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <div className="tooltip-box">{app.description}</div>
      </div>

      {/* Install button */}
      <div className="item-action" onClick={(e) => { e.stopPropagation(); onInstall(); }}>
        {isInstalling ? (
          <Loader2 size={13} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : isInstalled ? (
          <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Done</span>
        ) : (
          <button className="btn btn-primary btn-sm" aria-label={`Install ${app.name}`}>
            <Download size={11} /> Install
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
type AppStatusMap = Record<string, InstalledStatus>;

export default function InstallPage() {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [statusMap, setStatusMap] = useState<AppStatusMap>({});
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

  const setStatus = (id: string, status: InstalledStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const installSingle = async (id: string) => {
    setStatus(id, "installing");
    try {
      await invoke("install_package_stream", { packageId: id });
      setStatus(id, "installed");
    } catch {
      setStatus(id, "error");
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

  // Filter by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return APP_CATEGORIES;
    const q = search.toLowerCase();
    return APP_CATEGORIES.map((cat) => ({
      ...cat,
      apps: cat.apps.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.apps.length > 0);
  }, [search]);

  return (
    <div className="checklist-page fade-in">
      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-wrap" style={{ width: 260 }}>
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 8, color: "var(--text-muted)" }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="topbar-divider" />

        {/* Selection controls */}
        <div className="action-bar-section">
          <button className="btn btn-ghost btn-sm" onClick={selectAll}>
            <CheckCheck size={13} /> Select All
          </button>
          {selected.size > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        <div className="action-bar-spacer" />

        {/* Install selected */}
        <button
          className="btn btn-primary"
          onClick={installSelected}
          disabled={selected.size === 0 || isInstalling}
          aria-label={`Install ${selected.size} selected apps`}
        >
          {isInstalling ? (
            <><Loader2 size={14} className="animate-spin" /> Installing...</>
          ) : (
            <>
              <Download size={14} />
              Install Selected
              {selected.size > 0 && (
                <span className="badge-count">{selected.size}</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Categories Grid */}
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
                {catSelected > 0 && (
                  <span className="badge-count">{catSelected}</span>
                )}
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
            <div className="empty-state-title">No apps found for "{search}"</div>
            <div className="empty-state-sub">Try a different search term</div>
          </div>
        )}
      </div>

      <TerminalOutput />
    </div>
  );
}
