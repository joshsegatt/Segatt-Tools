"use client";

import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Trash2,
  Zap,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  History,
  Play,
  LifeBuoy,
} from "lucide-react";

export default function CleanerPage() {
  const { t } = useLanguage();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const CLEANUP_TASKS = [
    {
      id: "clean_temp",
      name: t("cleaner.items.temp"),
      description: "Remove %TEMP% and system temporary files.",
      category: "Basic",
    },
    {
      id: "clean_prefetch",
      name: t("cleaner.items.prefetch"),
      description: "Clears Prefetch folder for consistency.",
      category: "System",
    },
    {
      id: "flush_dns",
      name: t("cleaner.items.dns"),
      description: "Flushes DNS revolver cache for network latency.",
      category: "Optimization",
    },
    {
      id: "clean_windows_update",
      name: t("cleaner.items.win_update"),
      description: "Deletes old update files and logs.",
      category: "System",
    },
    {
      id: "clean_shader_cache",
      name: t("cleaner.items.shader"),
      description: "Resets DirectX shader cache to fix stuttering.",
      category: "Gaming",
    },
  ];

  const openSystemRestore = async () => {
    try {
      await invoke("apply_tweak", { id: "open_system_restore" });
    } catch (err: any) {
      alert(err);
    }
  };

  const runTask = async (id: string) => {
    if (!safetyConfirmed && id !== "flush_dns") {
       alert(t("cleaner.safety_first") + ": " + t("cleaner.safety_desc"));
       return;
    }
    setRunning(id);
    try {
      const res: any = await invoke("run_cleanup", { id });
      setResults((prev) => ({ ...prev, [id]: res.message }));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [id]: `Error: ${err}` }));
    } finally {
      setRunning(null);
    }
  };

  const createRestorePoint = async () => {
    setRestoring(true);
    try {
      const msg: string = await invoke("create_restore_point");
      alert(msg);
      setSafetyConfirmed(true);
    } catch (err: any) {
      alert(`Critical: ${err}`);
    } finally {
      setRestoring(false);
    }
  };

  const runAll = async () => {
    if (!safetyConfirmed) {
      if (confirm(t("cleaner.safety_desc"))) {
        await createRestorePoint();
      } else {
        return;
      }
    }
    for (const task of CLEANUP_TASKS) {
      await runTask(task.id);
    }
  };

  return (
    <div className="fade-in">
      {/* Header with Safety Actions */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
            Segatt <span style={{ color: "var(--accent)" }}>Cleaner</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("cleaner.subtitle")}</p>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={openSystemRestore}
              title={t("cleaner.restore_btn")}
              style={{ border: "1px solid var(--border)", color: "var(--warning)" }}
            >
              <LifeBuoy size={14} />
              {t("cleaner.restore_btn")}
            </button>

            <button 
              className={`btn btn-sm ${safetyConfirmed ? 'btn-secondary' : 'btn-primary'}`}
              onClick={createRestorePoint}
              disabled={restoring}
            >
              <History size={14} className={restoring ? "animate-spin" : ""} />
              {restoring ? "..." : t("tweaks.create_point")}
            </button>

            <button className="btn btn-primary btn-sm" onClick={runAll} disabled={!!running}>
              <Play size={14} /> {t("cleaner.clean_btn")}
            </button>
        </div>
      </div>

      {!safetyConfirmed && (
        <div className="alert-banner" style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.2)", padding: 12, borderRadius: 8, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle size={18} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
            {t("cleaner.safety_desc")}
          </span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="checklist-grid" style={{ alignItems: "start" }}>
        {["Basic", "System", "Optimization", "Gaming"].map(category => (
          <div key={category} className="category-column">
            <div className="category-title">
              {category === "Gaming" ? <Zap size={13} style={{ color: "var(--accent)" }} /> : <ShieldCheck size={13} />}
              {category}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CLEANUP_TASKS.filter(t => t.category === category).map(task => (
                <div key={task.id} className="item-row" style={{ padding: "12px 14px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{task.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{task.description}</div>
                    {results[task.id] && (
                      <div style={{ fontSize: 10, color: results[task.id].includes("Error") ? "var(--danger)" : "var(--accent)", marginTop: 6, fontWeight: 600 }}>
                        {results[task.id]}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => runTask(task.id)}
                    disabled={running === task.id}
                  >
                    {running === task.id ? <RotateCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
