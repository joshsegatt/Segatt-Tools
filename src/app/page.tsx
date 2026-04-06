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
  
  // Updater state
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "up-to-date" | "available" | "downloading" | "installing">("idle");
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [updateObj, setUpdateObj] = useState<any>(null);

  const CURRENT_VERSION = "1.7.0";

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

  const checkUpdates = async () => {
    setUpdateStatus("checking");
    try {
      const update = await check();
      if (update) {
        setLatestVersion(update.version);
        setUpdateObj(update);
        setUpdateStatus("available");
      } else {
        setUpdateStatus("up-to-date");
      }
    } catch (error) {
      console.error("Update check failed:", error);
      setUpdateStatus("idle");
    }
  };

  const installUpdate = async () => {
    if (!updateObj) return;
    setUpdateStatus("downloading");
    
    try {
      let downloaded = 0;
      let contentLength = 0;

      await updateObj.downloadAndInstall((event: any) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            setUpdateStatus("downloading");
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setDownloadProgress(Math.round((downloaded / contentLength) * 100));
            }
            break;
          case 'Finished':
            setUpdateStatus("installing");
            break;
        }
      });

      // Restart the app
      await relaunch();
    } catch (error) {
      console.error("Update installation failed:", error);
      alert("Update failed. Please try manual download.");
      setUpdateStatus("available");
    }
  };

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
      <PageHeader 
        title={t("tabs.dashboard")} 
        description={t("dashboard.system_summary") || "System overview and status"}
      />

      {/* Admin warning */}
      {isAdmin === false && (
        <div className="admin-banner-elite">
          <ShieldAlert size={16} />
          <span>{t("dashboard.admin_warn")}</span>
        </div>
      )}

      {/* System Stats Strip */}
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
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {ramUsed} / {ramTotal} GB
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
                boxShadow: ramPct > 85 ? "0 0 10px var(--danger)" : "var(--accent-glow)"
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Shield size={12} className="text-accent" />
            {t("dashboard.privacy")}
          </div>
          <div className="stat-value text-success">
            {t("dashboard.privacy_status")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
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

      {/* Main Grid */}
      <section className="dashboard-grid-container">
        <h2 className="grid-label">{t("dashboard.quick_actions")}</h2>
        
        <div className="quick-grid">
          <Link href="/install" style={{ textDecoration: "none" }}>
            <div className="quick-card">
              <div className="quick-card-icon">
                <Package size={22} />
              </div>
              <div className="quick-card-content">
                <div className="quick-card-title">{t("dashboard.install_title")}</div>
                <div className="quick-card-desc">
                  {t("dashboard.install_desc")}
                </div>
              </div>
              <div className="quick-card-footer">
                {t("dashboard.open_installer")} <ArrowRight size={12} />
              </div>
            </div>
          </Link>

          <Link href="/tweaks" style={{ textDecoration: "none" }}>
            <div className="quick-card">
              <div className="quick-card-icon">
                <Wrench size={22} />
              </div>
              <div className="quick-card-content">
                <div className="quick-card-title">{t("dashboard.tweaks_title")}</div>
                <div className="quick-card-desc">
                  {t("dashboard.tweaks_desc")}
                </div>
              </div>
              <div className="quick-card-footer">
                {t("dashboard.open_tweaks")} <ArrowRight size={12} />
              </div>
            </div>
          </Link>

          <Link href="/fixes" style={{ textDecoration: "none" }}>
            <div className="quick-card">
              <div className="quick-card-icon">
                <ShieldAlert size={22} />
              </div>
              <div className="quick-card-content">
                <div className="quick-card-title">{t("fixes.title")}</div>
                <div className="quick-card-desc">
                  Repare erros do sistema, SFC & DISM com um clique.
                </div>
              </div>
              <div className="quick-card-footer">
                Abrir Reparos <ArrowRight size={12} />
              </div>
            </div>
          </Link>

          <Link href="/config" style={{ textDecoration: "none" }}>
            <div className="quick-card">
              <div className="quick-card-icon">
                <Settings size={22} />
              </div>
              <div className="quick-card-content">
                <div className="quick-card-title">{t("management.title")}</div>
                <div className="quick-card-desc">
                  Controle atualizações e recursos do Windows.
                </div>
              </div>
              <div className="quick-card-footer">
                Gerenciar Sistema <ArrowRight size={12} />
              </div>
            </div>
          </Link>

          {/* Updater Card */}
          <div className="quick-card glass-panel" style={{ background: "rgba(255,255,255,0.01)" }}>
            <div className="quick-card-icon" style={{ background: "rgba(100,100,100,0.05)", color: "var(--text-muted)" }}>
              <RefreshCw size={22} className={updateStatus === "checking" ? "animate-spin" : ""} />
            </div>
            <div className="quick-card-content">
              <div className="quick-card-title">{t("dashboard.check_updates")}</div>
              <div className="quick-card-desc" style={{ color: updateStatus === "available" ? "var(--warning)" : "inherit" }}>
                {updateStatus === "idle" && `v${CURRENT_VERSION}`}
                {updateStatus === "checking" && t("dashboard.checking")}
                {updateStatus === "up-to-date" && t("dashboard.up_to_date")}
                {updateStatus === "available" && `${t("dashboard.update_available")} (v${latestVersion})`}
                {updateStatus === "downloading" && (
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <div style={{ fontSize: 10, marginBottom: 4 }}>{t("common.loading")} {downloadProgress}%</div>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                )}
                {updateStatus === "installing" && "Installing..."}
              </div>
            </div>
            <div className="quick-card-actions">
              {updateStatus === "available" ? (
                <button 
                  onClick={installUpdate}
                  className="btn btn-primary btn-sm"
                  style={{ background: "var(--warning)", color: "black", border: "none" }}
                >
                  Update Now
                </button>
              ) : (updateStatus === "idle" || updateStatus === "up-to-date") ? (
                <button 
                  onClick={checkUpdates}
                  className="btn btn-secondary btn-sm"
                >
                  Check
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Actions / Support */}
      <section className="dashboard-secondary-grid" style={{ marginTop: 32 }}>
        <div className="quick-grid">
          {/* Support Card */}
          <div className="quick-card support-card">
            <div className="quick-card-icon support-icon">
              <Heart size={22} fill="currentColor" />
            </div>
            <div className="quick-card-content">
              <div className="quick-card-title">{t("dashboard.support_title")}</div>
              <div className="quick-card-desc">
                {t("dashboard.support_desc")}
              </div>
            </div>
            <button 
              onClick={() => openLink("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=segatt22@gmail.com&item_name=Segatt+Tools+Support")}
              className="btn btn-primary"
              style={{ 
                background: "var(--danger)", 
                boxShadow: "0 4px 20px oklch(65% 0.2 25 / 0.4)",
                border: "none"
              }}
            >
              {t("dashboard.donate_btn")}
            </button>
          </div>

          {/* Social Card */}
          <div className="quick-card glass-panel" style={{ background: "rgba(255,255,255,0.01)" }}>
            <div className="quick-card-icon" style={{ background: "rgba(100,100,100,0.05)", color: "var(--text-muted)" }}>
              <ExternalLink size={22} />
            </div>
            <div className="quick-card-content">
              <div className="quick-card-title">{t("dashboard.socials_title")}</div>
              <div className="social-links" style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <button onClick={() => openLink("https://github.com/joshsegatt")} className="btn-ghost btn-icon">
                  <Github size={20} />
                </button>
                <button onClick={() => openLink("https://www.instagram.com/josh_segatt")} className="btn-ghost btn-icon">
                  <Instagram size={20} />
                </button>
                <button onClick={() => openLink("https://www.linkedin.com/in/josh-segat-522760102/?locale=en")} className="btn-ghost btn-icon">
                  <Linkedin size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .elite-dashboard {
          padding: 24px;
          max-width: 1200px;
          width: 100%;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -1px;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .grid-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .quick-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .quick-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .quick-card:hover .quick-card-footer {
          opacity: 1;
        }

        .support-card {
           background: linear-gradient(135deg, oklch(65% 0.2 25 / 0.1), transparent 80%);
           border-color: oklch(65% 0.2 25 / 0.3);
        }

        .support-icon {
          background: oklch(65% 0.2 25 / 0.2);
          color: var(--danger);
          border-color: oklch(65% 0.2 25 / 0.4);
        }

        .text-accent { color: var(--accent); }
        .text-success { color: var(--success); }
      `}</style>
    </div>
  );
}
