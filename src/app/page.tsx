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
  Github,
  Instagram,
  Linkedin,
  Heart,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { openUrl } from "@tauri-apps/plugin-opener";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useLanguage } from "@/hooks/useLanguage";
import { PageHeader } from "@/components/ui/PageHeader";

interface SystemStats {
  cpu_usage: number;
  used_memory: number;
  total_memory: number;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const fetchStats = async () => {
    try {
      const data = await invoke<SystemStats>("get_system_stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStats();
    invoke<boolean>("check_admin").then(setIsAdmin).catch(() => setIsAdmin(false));

    // Poll every 3 seconds
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const openLink = async (url: string) => {
    try {
      await openUrl(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  const ramPct = stats
    ? Math.round((stats.used_memory / stats.total_memory) * 100)
    : 0;
  const cpuPct = stats ? Math.round(stats.cpu_usage) : 0;
  const ramUsed = stats ? (stats.used_memory / 1024).toFixed(1) : "—";
  const ramTotal = stats ? (stats.total_memory / 1024).toFixed(0) : "—";

  return (
    <div className="fade-in elite-dashboard">
      <div className="dashboard-header-lite">
        <h1 className="dashboard-title-elite">{t("tabs.dashboard")}</h1>
        <p className="dashboard-sub-elite">{t("dashboard.system_summary") || "System health at a glance"}</p>
      </div>

      {/* Admin warning */}
      {isAdmin === false && (
        <div className="admin-banner-elite">
          <ShieldAlert size={18} />
          <span>{t("dashboard.admin_warn")}</span>
        </div>
      )}

      {/* System Stats Strip - Densified */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-label">
            <Activity size={12} className="text-accent" />
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
                boxShadow: cpuPct > 80 ? "0 0 10px var(--danger)" : "var(--accent-glow)"
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Cpu size={12} className="text-accent" />
            {t("dashboard.ram")}
          </div>
          <div className="stat-value">{stats ? `${ramPct}%` : "—"}</div>
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
                boxShadow: ramPct > 85 ? "0 0 10px var(--danger)" : "var(--accent-glow)"
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, fontWeight: 700 }}>
            {ramUsed} / {ramTotal} GB
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Shield size={12} className="text-accent" />
            {t("dashboard.privacy")}
          </div>
          <div className="stat-value text-success" style={{ fontSize: 20 }}>
            {t("dashboard.privacy_status")}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
            {t("dashboard.zero_telemetry")}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <CheckCircle2 size={12} className="text-accent" />
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
              fontSize: 20,
            }}
          >
            {isAdmin === null 
              ? t("dashboard.admin_checking") 
              : isAdmin 
                ? t("dashboard.admin_elevated") 
                : t("dashboard.admin_standard")}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
            {isAdmin ? t("dashboard.admin_full") : t("dashboard.admin_limited")}
          </div>
        </div>
      </div>

      <section className="dashboard-main-content">
        <h2 className="grid-label">{t("dashboard.quick_actions")}</h2>
        
        <div className="quick-grid">
          <Link href="/install" className="quick-card-link">
            <div className="quick-card">
              <div className="quick-card-icon">
                <Package size={24} />
              </div>
              <div className="quick-card-body">
                <div className="quick-card-title">{t("dashboard.install_title")}</div>
                <div className="quick-card-desc">{t("dashboard.install_desc")}</div>
              </div>
              <div className="quick-card-tag">{t("dashboard.open_installer")} <ArrowRight size={12} /></div>
            </div>
          </Link>

          <Link href="/tweaks" className="quick-card-link">
            <div className="quick-card">
              <div className="quick-card-icon">
                <Wrench size={24} />
              </div>
              <div className="quick-card-body">
                <div className="quick-card-title">{t("dashboard.tweaks_title")}</div>
                <div className="quick-card-desc">{t("dashboard.tweaks_desc")}</div>
              </div>
              <div className="quick-card-tag">{t("dashboard.open_tweaks")} <ArrowRight size={12} /></div>
            </div>
          </Link>

          <Link href="/fixes" className="quick-card-link">
            <div className="quick-card">
              <div className="quick-card-icon">
                <ShieldAlert size={24} />
              </div>
              <div className="quick-card-body">
                <div className="quick-card-title">{t("fixes.title")}</div>
                <div className="quick-card-desc">Repare erros de SFC, DISM & Update.</div>
              </div>
              <div className="quick-card-tag">Reparar Agora <ArrowRight size={12} /></div>
            </div>
          </Link>

          <Link href="/config" className="quick-card-link">
            <div className="quick-card">
              <div className="quick-card-icon">
                <Settings size={24} />
              </div>
              <div className="quick-card-body">
                <div className="quick-card-title">{t("management.title")}</div>
                <div className="quick-card-desc">Controle do Windows & Atualizações.</div>
              </div>
              <div className="quick-card-tag">Gerenciar <ArrowRight size={12} /></div>
            </div>
          </Link>
        </div>
      </section>

      {/* Socials & Support Strip - Very Compact */}
      <footer className="dashboard-footer-elite">
        <div className="social-mini-card glass-panel" onClick={() => openLink("https://github.com/joshsegatt")}>
          <Github size={16} /> <span>GitHub</span>
        </div>
        <div className="social-mini-card glass-panel" onClick={() => openLink("https://www.instagram.com/josh_segatt")}>
          <Instagram size={16} /> <span>Instagram</span>
        </div>
        <div 
          className="donate-mini-card" 
          onClick={() => openLink("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=segatt22@gmail.com&item_name=Segatt+Tools+Support")}
        >
          <Heart size={16} fill="white" /> <span>{t("dashboard.donate_btn")}</span>
        </div>
      </footer>

      <style jsx>{`
        .elite-dashboard {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          max-width: 1200px;
        }

        .dashboard-header-lite {
          margin-bottom: 8px;
        }

        .dashboard-title-elite {
          font-size: 36px;
          font-weight: 950;
          color: var(--text-primary);
          line-height: 1;
        }

        .dashboard-sub-elite {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .grid-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding-left: 2px;
        }

        .quick-card-link {
          text-decoration: none;
          color: inherit;
        }

        .quick-card-body {
          flex: 1;
        }

        .quick-card-tag {
          margin-top: 12px;
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .quick-card:hover .quick-card-tag {
          opacity: 1;
        }

        .dashboard-footer-elite {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 20px;
        }

        .social-mini-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .donate-mini-card {
          margin-left: auto;
          background: var(--danger);
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: var(--r-md);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 15px oklch(65% 0.2 25 / 0.3);
          transition: transform 0.2s;
        }

        .donate-mini-card:hover { border-color: transparent; }

        .text-success { color: var(--success); }
      `}</style>
    </div>
  );
}
