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

interface SystemStats {
  cpu_usage: number;
  used_memory: number;
  total_memory: number;
}

export default function Dashboard() {
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
            Run as <strong>Administrator</strong> to apply tweaks and registry changes.
          </span>
        </div>
      )}

      {/* System Stats Strip */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-label">
            <Activity size={12} />
            CPU Usage
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
            RAM
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
            Privacy
          </div>
          <div className="stat-value" style={{ color: "var(--success)", fontSize: 20 }}>
            Protected
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Zero telemetry mode
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <CheckCircle2 size={12} />
            Admin
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
            {isAdmin === null ? "Checking..." : isAdmin ? "Elevated" : "Standard"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {isAdmin ? "Full access granted" : "Limited functionality"}
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
        Quick Actions
      </div>

      <div className="quick-grid">
        <Link href="/install" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Package size={20} />
            </div>
            <div>
              <div className="quick-card-title">Install Software</div>
              <div className="quick-card-desc">
                Browse 40+ pre-curated apps by category. Select multiple and install in one click.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              Open Installer <ArrowRight size={12} />
            </div>
          </div>
        </Link>

        <Link href="/tweaks" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Wrench size={20} />
            </div>
            <div>
              <div className="quick-card-title">System Tweaks</div>
              <div className="quick-card-desc">
                Privacy, performance and interface tweaks. Apply presets or select individually.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              Open Tweaks <ArrowRight size={12} />
            </div>
          </div>
        </Link>

        <Link href="/ai" style={{ textDecoration: "none" }}>
          <div className="quick-card">
            <div className="quick-card-icon">
              <Cpu size={20} />
            </div>
            <div>
              <div className="quick-card-title">AI Diagnostics</div>
              <div className="quick-card-desc">
                Local AI analyzes your hardware and recommends optimizations. Zero cloud, zero cost.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
              Open AI <ArrowRight size={12} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
