"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Loader2,
  Play,
  ShieldAlert,
  RotateCcw,
  CheckCheck,
  X,
  Zap,
  Shield,
  Monitor,
  Settings,
} from "lucide-react";

// ─── Tweak Data ──────────────────────────────────────────────
interface TweakDef {
  id: string;
  name: string;
  description: string;
  column: "privacy" | "performance" | "interface" | "system";
  preset?: ("essential" | "privacy" | "gaming")[];
}

const TWEAKS: TweakDef[] = [
  // Privacy column
  { id: "disable_telemetry",       name: "Disable Telemetry",            description: "Stops Windows from sending diagnostic and usage data to Microsoft servers.",       column: "privacy", preset: ["essential", "privacy"] },
  { id: "disable_cortana",         name: "Disable Cortana",              description: "Disables the Cortana virtual assistant and its background data collection.",         column: "privacy", preset: ["privacy"] },
  { id: "disable_activity_feed",   name: "Disable Activity Feed",        description: "Prevents Windows from tracking your activity history across devices.",               column: "privacy", preset: ["privacy"] },
  { id: "remove_bing_search",      name: "Remove Bing from Search",      description: "Removes Bing web results from the Windows Start Menu search.",                       column: "privacy", preset: ["essential", "privacy"] },
  { id: "disable_location",        name: "Disable Location Tracking",    description: "Prevents apps from accessing your device location.",                                  column: "privacy", preset: ["privacy"] },
  { id: "disable_advertising_id",  name: "Disable Advertising ID",       description: "Stops advertisers from tracking your usage patterns across apps.",                    column: "privacy", preset: ["essential", "privacy"] },
  { id: "disable_wifi_sense",      name: "Disable WiFi Sense",           description: "Prevents Windows from automatically connecting to shared networks.",                  column: "privacy" },
  { id: "disable_feedback",        name: "Disable Feedback Prompts",     description: "Stops Windows from asking for feedback and sending it to Microsoft.",                 column: "privacy", preset: ["privacy"] },

  // Performance column
  { id: "optimize_hpet",           name: "Optimize HPET",                description: "Disables High Precision Event Timer to reduce CPU overhead in some configurations.", column: "performance", preset: ["gaming"] },
  { id: "disable_game_bar",        name: "Disable Game Bar",             description: "Removes the Xbox Game Bar overlay to free resources for gaming.",                    column: "performance", preset: ["gaming"] },
  { id: "high_performance_plan",   name: "Set High Performance Plan",    description: "Switches Windows power plan to maximum performance mode.",                            column: "performance", preset: ["essential", "gaming"] },
  { id: "disable_superfetch",      name: "Disable SysMain (Superfetch)", description: "Disables the service that pre-loads apps — recommended for SSDs.",                  column: "performance", preset: ["essential"] },
  { id: "disable_search_indexing", name: "Disable Search Indexing",      description: "Stops background drive indexing. Reduces disk I/O on SSDs.",                         column: "performance" },
  { id: "disable_visual_fx",       name: "Disable Visual Effects",       description: "Turns off animations and transparency effects for maximum responsiveness.",           column: "performance", preset: ["essential"] },
  { id: "set_dns_cloudflare",      name: "Set DNS to Cloudflare",        description: "Changes DNS to 1.1.1.1 and 1.0.0.1 for faster, more private browsing.",              column: "performance" },

  // Interface column
  { id: "dark_mode",               name: "Enable Dark Mode",             description: "Forces dark mode for apps and system UI.",                                            column: "interface", preset: ["essential"] },
  { id: "classic_context_menu",    name: "Classic Context Menu",         description: "Restores the full Windows 10-style right-click context menu in Windows 11.",          column: "interface", preset: ["essential"] },
  { id: "show_file_extensions",    name: "Show File Extensions",         description: "Makes hidden file extensions (e.g., .exe, .pdf) visible in Explorer.",               column: "interface", preset: ["essential"] },
  { id: "show_hidden_files",       name: "Show Hidden Files",            description: "Reveals hidden files and folders in File Explorer.",                                  column: "interface" },
  { id: "disable_mouse_accel",     name: "Disable Mouse Acceleration",   description: "Removes mouse pointer precision for consistent cursor movement.",                    column: "interface", preset: ["gaming"] },

  // System column
  { id: "enable_long_paths",       name: "Enable Long File Paths",       description: "Removes the 260-character path length limit in Windows.",                            column: "system", preset: ["essential"] },
  { id: "enable_f8_boot",          name: "Enable F8 Boot Menu",          description: "Restores the ability to access boot options by pressing F8 on startup.",             column: "system" },
  { id: "disable_fast_startup",    name: "Disable Fast Startup",         description: "Ensures a clean shutdown each time instead of a hybrid sleep state.",                column: "system" },
  { id: "disable_windows_update",  name: "Pause Windows Updates",        description: "Pauses Windows Update for 1 year. Updates can be re-enabled anytime.",              column: "system" },
  { id: "create_restore_point",    name: "Create Restore Point",         description: "Creates a System Restore Point before making changes. Highly recommended.",          column: "system", preset: ["essential"] },
];

const COLUMNS: { key: TweakDef["column"]; label: string; icon: React.ElementType }[] = [
  { key: "privacy",     label: "Privacy",     icon: Shield },
  { key: "performance", label: "Performance", icon: Zap },
  { key: "interface",   label: "Interface",   icon: Monitor },
  { key: "system",      label: "System",      icon: Settings },
];

const PRESETS = [
  { key: "essential", label: "⚡ Essential Tweaks",  desc: "Safe, recommended changes for all users" },
  { key: "privacy",   label: "🛡 Privacy Pack",       desc: "Maximum privacy with minimal impact" },
  { key: "gaming",    label: "🎮 Gaming Mode",        desc: "Optimize for gaming performance" },
] as const;

// ─── Tweak Row Component ────────────────────────────────────
interface TweakRowProps {
  tweak: TweakDef;
  isSelected: boolean;
  onToggle: () => void;
}

const TweakRow = ({ tweak, isSelected, onToggle }: TweakRowProps) => (
  <div
    className={`item-row ${isSelected ? "selected" : ""}`}
    onClick={onToggle}
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

    <span className="item-name">{tweak.name}</span>

    <div className="tooltip-wrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0, cursor: "help" }}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
      <div className="tooltip-box">{tweak.description}</div>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────
export default function TweaksPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin]   = useState<boolean | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [notification, setNotification] = useState<{ type: "success"|"error"|"info"; msg: string } | null>(null);

  useEffect(() => {
    invoke("check_admin").then((v) => setIsAdmin(v as boolean)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(t);
  }, [notification]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const applyPreset = (key: typeof PRESETS[number]["key"]) => {
    const ids = TWEAKS.filter((t) => t.preset?.includes(key)).map((t) => t.id);
    setSelected(new Set(ids));
  };

  const applySelected = async () => {
    if (!isAdmin) {
      setNotification({ type: "error", msg: "Administrator privileges required to apply tweaks." });
      return;
    }
    setIsApplying(true);
    let ok = 0;
    for (const id of selected) {
      try { await invoke("apply_tweak", { id }); ok++; }
      catch (e) { console.error(`Tweak ${id} failed:`, e); }
    }
    setIsApplying(false);
    setNotification({ type: "success", msg: `${ok} tweak(s) applied successfully.` });
    setSelected(new Set());
  };

  const createRestorePoint = async () => {
    setNotification({ type: "info", msg: "Creating system restore point..." });
    try {
      const msg: string = await invoke("create_restore_point");
      setNotification({ type: "success", msg });
    } catch (e: any) {
      setNotification({ type: "error", msg: e.toString() });
    }
  };

  return (
    <div className="checklist-page fade-in">
      {/* Admin warning */}
      {isAdmin === false && (
        <div className="admin-banner">
          <ShieldAlert size={14} />
          <span>Run as <strong>Administrator</strong> to apply registry tweaks.</span>
        </div>
      )}

      {/* Preset strip */}
      <div className="preset-strip">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className="preset-btn"
            onClick={() => applyPreset(p.key)}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="action-bar">
        <div className="action-bar-section">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelected(new Set(TWEAKS.map((t) => t.id)))}
          >
            <CheckCheck size={13} /> Select All
          </button>
          {selected.size > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        <div className="action-bar-spacer" />

        <button
          className="btn btn-secondary btn-sm"
          onClick={createRestorePoint}
          title="Create a restore point before applying tweaks"
        >
          <RotateCcw size={13} /> Restore Point
        </button>

        <button
          className="btn btn-primary"
          onClick={applySelected}
          disabled={selected.size === 0 || isApplying}
        >
          {isApplying ? (
            <><Loader2 size={14} className="animate-spin" /> Applying...</>
          ) : (
            <>
              <Play size={14} />
              Apply Tweaks
              {selected.size > 0 && <span className="badge-count">{selected.size}</span>}
            </>
          )}
        </button>
      </div>

      {/* Two-column checklist grid */}
      <div className="checklist-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {COLUMNS.map(({ key, label, icon: Icon }) => {
          const tweaks = TWEAKS.filter((t) => t.column === key);
          const colSelected = tweaks.filter((t) => selected.has(t.id)).length;

          return (
            <div key={key} className="category-col">
              <div className="category-header">
                <div className="category-title">
                  <Icon size={13} />
                  {label}
                </div>
                {colSelected > 0 && <span className="badge-count">{colSelected}</span>}
              </div>

              {tweaks.map((tweak) => (
                <TweakRow
                  key={tweak.id}
                  tweak={tweak}
                  isSelected={selected.has(tweak.id)}
                  onToggle={() => toggle(tweak.id)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`toast toast-${notification.type} fade-in`}>
          {notification.type === "success" ? "✓" : notification.type === "error" ? "✕" : "ℹ"}
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
