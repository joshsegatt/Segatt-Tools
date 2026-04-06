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
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";

// ─── Main Page ───────────────────────────────────────────────
export default function CleanerPage() {
  const { t } = useLanguage();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const CLEANUP_TASKS = [
    { id: "clean_temp", name: t("cleaner.items.temp"), description: "Remove %TEMP% and system temporary files.", category: "Basic" },
    { id: "clean_recycle_bin", name: t("cleaner.items.recycle_bin"), description: "Empties the recycle bin from all drives.", category: "Basic" },
    { id: "clean_prefetch", name: t("cleaner.items.prefetch"), description: "Clears Prefetch folder for consistency.", category: "System" },
    { id: "clean_windows_old", name: t("cleaner.items.win_old"), description: "Removes residues from previous Windows installations.", category: "System" },
    { id: "clean_logs_minidumps", name: t("cleaner.items.logs"), description: "Clears system logs and error memory dumps.", category: "System" },
    { id: "flush_dns", name: t("cleaner.items.dns"), description: "Flushes DNS revolver cache for network latency.", category: "Optimization" },
    { id: "clean_thumbnails", name: t("cleaner.items.thumbnails"), description: "Resets icon and thumbnail cache for cleaner explorer.", category: "Optimization" },
    { id: "clean_delivery_optimization", name: t("cleaner.items.delivery_opt"), description: "Clears Windows Update delivery cache (GBs of space).", category: "Optimization" },
    { id: "clean_windows_update", name: t("cleaner.items.win_update"), description: "Deletes old update files and logs.", category: "System" },
    { id: "clean_shader_cache", name: t("cleaner.items.shader"), description: "Resets DirectX shader cache to fix stuttering.", category: "Gaming" },
  ];

  const openSystemRestore = async () => {
    try { await invoke("apply_tweak", { id: "open_system_restore" }); } catch {}
  };

  const runTask = async (id: string, silent = false) => {
    if (!safetyConfirmed && id !== "flush_dns") {
       if (!silent) alert(t("cleaner.safety_first"));
       return;
    }
    setRunning(id);
    try {
      const res: any = await invoke("run_cleanup", { id });
      setCompletedTasks((prev) => new Set(prev).add(id));
    } catch {} finally {
      setRunning(null);
    }
  };

  const createRestorePoint = async () => {
    setRestoring(true);
    try {
      await invoke("create_restore_point");
      setSafetyConfirmed(true);
      setCompletedTasks((prev) => new Set(prev).add("restore_point"));
    } finally {
      setRestoring(false);
    }
  };

  const runAll = async () => {
    setIsProcessingAll(true);
    try {
      if (!safetyConfirmed) await createRestorePoint();
      for (const task of CLEANUP_TASKS) await runTask(task.id, true);
    } finally {
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="cleaner-page fade-in">
      {/* Immersive Processing Overlay */}
      {isProcessingAll && (
        <div className="processing-overlay-elite">
          <div className="processing-modal-elite">
            <div className="processing-loader">
              <Zap size={32} className="text-accent" />
            </div>
            <div className="processing-status">
              {t("cleaner.clean_btn")}...
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Performing deep system maintenance.
            </p>
          </div>
        </div>
      )}

      <PageHeader 
        title="Cleaner" 
        description={t("cleaner.subtitle") || "Deep system maintenance and space recovery."}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={openSystemRestore}>
            <LifeBuoy size={14} /> {t("cleaner.restore_btn")}
          </button>
          <button 
            className={`btn btn-sm ${safetyConfirmed ? 'btn-secondary' : 'btn-primary'}`}
            onClick={createRestorePoint}
            disabled={restoring}
          >
            <History size={14} className={restoring ? "animate-spin" : ""} />
            {restoring ? "..." : t("tweaks.create_point")}
          </button>
          <button className="btn btn-primary btn-sm" onClick={runAll} disabled={!!running || isProcessingAll}>
            <Play size={14} /> {t("cleaner.clean_btn")}
          </button>
        </div>
      </PageHeader>

      {!safetyConfirmed && (
        <div className="admin-banner-elite">
          <ShieldAlert size={16} />
          <span>{t("cleaner.safety_desc")}</span>
        </div>
      )}

      <div className="elite-columns">
        {["Basic", "System", "Optimization", "Gaming"].map(category => (
          <div key={category} className="category-column">
            <div className="category-title-elite">
              {category === "Gaming" ? <Zap size={14} /> : category === "Security" ? <ShieldCheck size={14} /> : <Trash2 size={14} />}
              {category}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CLEANUP_TASKS.filter(t => t.category === category).map(task => (
                <div key={task.id} className={`cleaner-card ${completedTasks.has(task.id) ? 'completed' : ''}`}>
                  <div className="cleaner-card-content">
                    <div className="cleaner-card-title">
                      {task.name}
                      {completedTasks.has(task.id) && <CheckCircle2 size={14} className="text-accent" />}
                    </div>
                    <div className="cleaner-card-desc">{task.description}</div>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${completedTasks.has(task.id) ? 'btn-ghost' : 'btn-secondary'}`} 
                    onClick={() => runTask(task.id)}
                    disabled={running === task.id || isProcessingAll}
                    style={{ padding: '6px 10px' }}
                  >
                    {running === task.id ? (
                      <RotateCcw size={14} className="animate-spin" />
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


