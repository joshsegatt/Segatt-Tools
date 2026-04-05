"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Package,
  Wrench,
  Cpu,
  Activity,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

interface SystemStats {
  cpu_usage: number;
  used_memory: number;
  total_memory: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ctx: any = await invoke("get_system_context");
        setStats({
          cpu_usage: ctx.cpu_usage,
          used_memory: ctx.used_memory,
          total_memory: ctx.total_memory,
        });
        const admin: boolean = await invoke("check_admin");
        setIsAdmin(admin);
      } catch {
        // Tauri not available in dev browser
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const ramPct = stats
    ? Math.round((stats.used_memory / stats.total_memory) * 100)
    : 0;
  const cpuPct = stats ? Math.round(stats.cpu_usage) : 0;
  const ramUsed = stats ? (stats.used_memory / 1024).toFixed(1) : "—";
  const ramTotal = stats ? (stats.total_memory / 1024).toFixed(0) : "—";

  return (
    <div className="fade-in">
      {/* Admin warning */}
      {isAdmin === false && (
        <div className="admin-banner">
          <AlertTriangle size={14} />
          <span>
            {t("dashboard.admin_warn")}
          </span>
        </div>
      )}

      {/* System Stats Strip */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-label">
            <Activity size={12} />
            {t("dashboard.cpu_usage")}
          </div>
          <div className="stat-value">{stats ? `${cpuPct}%` : "—"}</div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{
                width: `${cpuPct}%`,
                background:
                  cpuPct > 80
                    ? "var(--danger)"
                    : cpuPct > 60
                    ? "var(--warning)"
                    : "var(--accent)",
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Cpu size={12} />
            {t("dashboard.ram")}
          </div>
          <div className="stat-value">{stats ? `${ramPct}%` : "—"}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {ramUsed} GB / {ramTotal} GB
          </div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{
                width: `${ramPct}%`,
                background:
                  ramPct > 85
                    ? "var(--danger)"
                    : ramPct > 65
                    ? "var(--warning)"
                    : "var(--accent)",
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Shield size={12} />
            {t("dashboard.privacy")}
          </div>
          <div className="stat-value" style={{ color: "var(--success)", fontSize: 20 }}>
            {t("dashboard.privacy_status")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {t("dashboard.zero_telemetry")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <CheckCircle2 size={12} />
            {t("dashboard.admin")}
          </div>
          <div
            className="stat-value"
            style={{
              color:
                isAdmin === null
                  ? "var(--text-muted)"
                  : isAdmin
                  ? "var(--success)"
                  : "var(--danger)",
              fontSize: 18,
            }}
          >
            {isAdmin === null 
              ? t("dashboard.admin_checking") 
              : isAdmin 
                ? t("dashboard.admin_elevated") 
                : t("dashboard.admin_standard")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {isAdmin ? t("dashboard.admin_full") : t("dashboard.admin_limited")}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: "0 16px 8px",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
        }}
      >
        {t("dashboard.quick_actions")}
      </div>

      <div className="quick-grid">
        <Link href="/install" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Package size={20} />
            </div>
            <div>
              <div className="quick-card-title">{t("dashboard.install_title")}</div>
              <div className="quick-card-desc">
                {t("dashboard.install_desc")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              {t("dashboard.open_installer")} <ArrowRight size={12} />
            </div>
          </div>
        </Link>

        <Link href="/tweaks" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Wrench size={20} />
            </div>
            <div>
              <div className="quick-card-title">{t("dashboard.tweaks_title")}</div>
              <div className="quick-card-desc">
                {t("dashboard.tweaks_desc")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              {t("dashboard.open_tweaks")} <ArrowRight size={12} />
            </div>
          </div>
        </Link>

        <Link href="/ai" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Cpu size={20} />
            </div>
            <div>
              <div className="quick-card-title">{t("dashboard.ai_title")}</div>
              <div className="quick-card-desc">
                {t("dashboard.ai_desc")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              {t("dashboard.open_ai")} <ArrowRight size={12} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
