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
  CheckCheck,
  Loader2,
} from "lucide-react";

export default function CleanerPage() {
  const { t } = useLanguage();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const CLEANUP_TASKS = [
    {
      id: "clean_temp",
      name: t("cleaner.items.temp"),
      description: "Remove %TEMP% and system temporary files.",
      category: "Basic",
    },
    {
      id: "clean_recycle_bin",
      name: t("cleaner.items.recycle_bin"),
      description: "Empties the recycle bin from all drives.",
      category: "Basic",
    },
    {
      id: "clean_prefetch",
      name: t("cleaner.items.prefetch"),
      description: "Clears Prefetch folder for consistency.",
      category: "System",
    },
    {
      id: "clean_windows_old",
      name: t("cleaner.items.win_old"),
      description: "Removes residues from previous Windows installations.",
      category: "System",
    },
    {
      id: "clean_logs_minidumps",
      name: t("cleaner.items.logs"),
      description: "Clears system logs and error memory dumps.",
      category: "System",
    },
    {
      id: "flush_dns",
      name: t("cleaner.items.dns"),
      description: "Flushes DNS revolver cache for network latency.",
      category: "Optimization",
    },
    {
      id: "clean_thumbnails",
      name: t("cleaner.items.thumbnails"),
      description: "Resets icon and thumbnail cache for cleaner explorer.",
      category: "Optimization",
    },
    {
      id: "clean_delivery_optimization",
      name: t("cleaner.items.delivery_opt"),
      description: "Clears Windows Update delivery cache (GBs of space).",
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
      setResults((prev) => ({ ...prev, "general": `Error: ${err}` }));
    }
  };

  const runTask = async (id: string, silent = false) => {
    if (!safetyConfirmed && id !== "flush_dns") {
       if (!silent) alert(t("cleaner.safety_first") + ": " + t("cleaner.safety_desc"));
       return;
    }
    setRunning(id);
    try {
      const res: any = await invoke("run_cleanup", { id });
      setResults((prev) => ({ ...prev, [id]: res.message }));
      setCompletedTasks((prev) => new Set(prev).add(id));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [id]: `Error: ${err}` }));
    } finally {
      setRunning(null);
    }
  };

  const createRestorePoint = async () => {
    setRestoring(true);
    try {
      await invoke("create_restore_point");
      setSafetyConfirmed(true);
      setCompletedTasks((prev) => new Set(prev).add("restore_point"));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, "general": `Critical: ${err}` }));
    } finally {
      setRestoring(false);
    }
  };

  const runAll = async () => {
    setIsProcessingAll(true);
    try {
      if (!safetyConfirmed) {
        await createRestorePoint();
      }
      for (const task of CLEANUP_TASKS) {
        await runTask(task.id, true);
      }
    } finally {
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Global Processing Modal */}
      {isProcessingAll && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <Loader2 className="animate-spin" size={48} style={{ color: "var(--accent)", marginBottom: 20 }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t("cleaner.clean_btn")}...</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Optimizing your system assets.</p>
            <div className="progress-mini-bar">
               <div className="progress-mini-fill" />
            </div>
          </div>
        </div>
      )}

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
              style={{ position: 'relative' }}
            >
              <History size={14} className={restoring ? "animate-spin" : ""} />
              {restoring ? "..." : t("tweaks.create_point")}
              {completedTasks.has("restore_point") && (
                <span className="status-done-chip" style={{ position: 'absolute', top: -8, right: -8, scale: '0.8' }}>
                  ✓ {t("install.status_done")}
                </span>
              )}
            </button>

            <button className="btn btn-primary btn-sm" onClick={runAll} disabled={!!running || isProcessingAll}>
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
                <div key={task.id} className="item-row" style={{ 
                  padding: "12px 14px", 
                  borderColor: completedTasks.has(task.id) ? "var(--accent-glow)" : "var(--border)",
                  background: completedTasks.has(task.id) ? "rgba(var(--accent-rgb), 0.02)" : "var(--bg-card)"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{task.name}</div>
                       {completedTasks.has(task.id) && (
                         <span className="status-done-chip">✓ DONE</span>
                       )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{task.description}</div>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${completedTasks.has(task.id) ? 'btn-ghost' : 'btn-secondary'}`} 
                    onClick={() => runTask(task.id)}
                    disabled={running === task.id || isProcessingAll}
                    style={{ minWidth: 40 }}
                  >
                    {running === task.id ? (
                      <RotateCcw size={14} className="animate-spin" />
                    ) : completedTasks.has(task.id) ? (
                      <CheckCheck size={14} style={{ color: "var(--accent)" }} />
                    ) : (
                      <Trash2 size={14} />
                    )}
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
