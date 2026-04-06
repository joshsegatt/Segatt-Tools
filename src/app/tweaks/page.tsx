"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "@/hooks/useLanguage";
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
  LifeBuoy,
} from "lucide-react";

// ─── Tweak Row Component ────────────────────────────────────
interface TweakDef {
  id: string;
  name: string;
  description: string;
  column: "privacy" | "performance" | "interface" | "system";
  preset?: ("essential" | "privacy" | "gaming")[];
}

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

import { PageHeader } from "@/components/ui/PageHeader";

// ─── Main Page ───────────────────────────────────────────────
export default function TweaksPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin]   = useState<boolean | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [notification, setNotification] = useState<{ type: "success"|"error"|"info"; msg: string } | null>(null);

  const TWEAKS: TweakDef[] = [
    { id: "disable_telemetry",       name: "Disable Telemetry",            description: "Stops Windows from sending diagnostic and usage data.",       column: "privacy", preset: ["essential", "privacy"] },
    { id: "disable_cortana",         name: "Disable Cortana",              description: "Disables the Cortana virtual assistant.",         column: "privacy", preset: ["privacy"] },
    { id: "disable_activity_feed",   name: "Disable Activity Feed",        description: "Prevents Windows from tracking your activity history.",               column: "privacy", preset: ["privacy"] },
    { id: "remove_bing_search",      name: "Remove Bing Search",           description: "Removes Bing results from Start Menu search.",                       column: "privacy", preset: ["essential", "privacy"] },
    { id: "disable_location",        name: "Disable Location",             description: "Prevents apps from accessing your location.",                                  column: "privacy", preset: ["privacy"] },
    { id: "disable_advertising_id",  name: "Disable Advertising ID",       description: "Stops advertisers from tracking your usage patterns.",                    column: "privacy", preset: ["essential", "privacy"] },
    { id: "disable_wifi_sense",      name: "Disable WiFi Sense",           description: "Prevents auto-connecting to shared networks.",                  column: "privacy" },
    { id: "disable_feedback",        name: "Disable Feedback",             description: "Stops Windows from asking for feedback.",                 column: "privacy", preset: ["privacy"] },

    { id: "optimize_hpet",           name: "Optimize HPET",                description: "Disables High Precision Event Timer to reduce lag.", column: "performance", preset: ["gaming"] },
    { id: "disable_game_bar",        name: "Disable Game Bar",             description: "Removes Xbox Game Bar overlay.",                    column: "performance", preset: ["gaming"] },
    { id: "high_performance_plan",   name: "High Performance Plan",        description: "Switches Windows to maximum performance mode.",                            column: "performance", preset: ["essential", "gaming"] },
    { id: "disable_superfetch",      name: "Disable SysMain",              description: "Disables service that pre-loads apps (SSD recommended).",                  column: "performance", preset: ["essential"] },
    { id: "disable_search_indexing", name: "Disable Indexing",             description: "Stops background drive indexing.",                         column: "performance" },
    { id: "disable_visual_fx",       name: "Disable Visual Effects",       description: "Turns off animations for responsiveness.",           column: "performance", preset: ["essential"] },
    { id: "set_dns_cloudflare",      name: "Set DNS Cloudflare",           description: "Changes DNS to 1.1.1.1 for privacy/speed.",              column: "performance" },

    { id: "dark_mode",               name: "Enable Dark Mode",             description: "Forces dark mode for system UI.",                                            column: "interface", preset: ["essential"] },
    { id: "classic_context_menu",    name: "Classic Context Menu",         description: "Restores Win10-style right-click menu in Win11.",          column: "interface", preset: ["essential"] },
    { id: "show_file_extensions",    name: "Show Extensions",              description: "Makes file extensions visible in Explorer.",               column: "interface", preset: ["essential"] },
    { id: "show_hidden_files",       name: "Show Hidden Files",            description: "Reveals hidden files in File Explorer.",                                  column: "interface" },
    { id: "disable_mouse_accel",     name: "Disable Mouse Accel",          description: "Removes pointer precision for gaming consistency.",                    column: "interface", preset: ["gaming"] },

    { id: "enable_long_paths",       name: "Enable Long Paths",            description: "Removes the 260-character path limit.",                            column: "system", preset: ["essential"] },
    { id: "enable_f8_boot",          name: "Enable F8 Boot",               description: "Restores F8 boot options access.",             column: "system" },
    { id: "disable_fast_startup",    name: "Disable Fast Startup",         description: "Ensures clean shutdown instead of hybrid sleep.",                column: "system" },
    { id: "disable_windows_update",  name: "Pause Updates",                description: "Pauses Windows Update to prevent background tasks.",              column: "system" },
    { id: "create_restore_point",    name: "Manual Restore Point",         description: "Creates a System Restore Point immediately.",          column: "system", preset: ["essential"] },
  ];

  const COLUMNS: { key: TweakDef["column"]; label: string; icon: React.ElementType }[] = [
    { key: "privacy",     label: t("tweaks.categories.privacy"),     icon: Shield },
    { key: "performance", label: t("tweaks.categories.performance"), icon: Zap },
    { key: "interface",   label: t("tweaks.categories.interface"),   icon: Monitor },
    { key: "system",      label: t("tweaks.categories.system"),      icon: Settings },
  ];

  const PRESETS = [
    { key: "essential", label: "Essential",  icon: "⚡", desc: "Safe, recommended changes" },
    { key: "privacy",   label: "Privacy",    icon: "🛡", desc: "Maximum privacy" },
    { key: "gaming",    label: "Gaming",     icon: "🎮", desc: "Optimize for FPS" },
  ] as const;

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

  const openSystemRestore = async () => {
    try {
      await invoke("apply_tweak", { id: "open_system_restore" });
    } catch (err: any) {
      setNotification({ type: "error", msg: err });
    }
  };

  const applySelected = async () => {
    if (!isAdmin) {
      setNotification({ type: "error", msg: "Admin privileges required." });
      return;
    }
    setIsApplying(true);
    let ok = 0;
    for (const id of selected) {
      try { await invoke("apply_tweak", { id }); ok++; }
      catch (e) { console.error(`Tweak ${id} failed:`, e); }
    }
    setIsApplying(false);
    setNotification({ type: "success", msg: `${ok} tweak applied.` });
    setSelected(new Set());
  };

  const createRestorePoint = async () => {
    setNotification({ type: "info", msg: "Creating restore point..." });
    try {
      const msg: string = await invoke("create_restore_point");
      setNotification({ type: "success", msg });
    } catch (e: any) {
      setNotification({ type: "error", msg: e.toString() });
    }
  };

  return (
    <div className="checklist-page fade-in">
      <PageHeader 
        title={t("tabs.tweaks")} 
        description={t("tweaks.description") || "Optimize Windows settings for performance and privacy."}
      >
        <div className="action-bar-elite">
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set(TWEAKS.map(t => t.id)))}>
            <CheckCheck size={14} />
          </button>
          
          <div className="topbar-divider" />

          <button className="btn btn-secondary btn-sm" onClick={createRestorePoint}>
            <RotateCcw size={14} />
          </button>

          <button
            className="btn btn-primary"
            onClick={applySelected}
            disabled={selected.size === 0 || isApplying}
          >
            {isApplying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Play size={14} />
                {selected.size > 0 && <span className="badge-count-elite">{selected.size}</span>}
              </>
            )}
          </button>
        </div>
      </PageHeader>

      {isAdmin === false && (
        <div className="admin-banner glass-panel" style={{ marginBottom: 24, borderRadius: 'var(--r-md)' }}>
          <ShieldAlert size={14} />
          <span>{t("dashboard.admin_warn")}</span>
        </div>
      )}

      <div className="preset-strip">
        <button className="preset-btn preset-btn-warning" onClick={openSystemRestore}>
          <LifeBuoy size={14} /> {t("tweaks.restore_btn")}
        </button>
        {PRESETS.map((p) => (
          <button key={p.key} className="preset-btn" onClick={() => applyPreset(p.key)}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="checklist-grid">
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
                {colSelected > 0 && <span className="badge-count-elite">{colSelected}</span>}
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

      {notification && (
        <div className={`toast toast-${notification.type} glass-panel fade-in`}>
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
