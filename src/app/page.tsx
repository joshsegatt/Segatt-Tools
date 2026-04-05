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
} from "lucide-react";
import Link from "next/link";
import { openUrl } from "@tauri-apps/plugin-opener";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
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
  
  // Updater state
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "up-to-date" | "available" | "downloading" | "installing">("idle");
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [updateObj, setUpdateObj] = useState<any>(null);

  const CURRENT_VERSION = "1.5.0";

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

      {/* Social & Support & Updater */}
      <div className="quick-grid" style={{ marginTop: 24 }}>
        {/* Updater Card */}
        <div className="quick-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="quick-card-icon" style={{ background: "rgba(100,100,100,0.1)", color: "var(--text-muted)" }}>
            <RefreshCw size={20} className={updateStatus === "checking" ? "spin" : ""} />
          </div>
          <div>
            <div className="quick-card-title">{t("dashboard.check_updates")}</div>
            <div className="quick-card-desc" style={{ color: updateStatus === "available" ? "var(--warning)" : "inherit" }}>
              {updateStatus === "idle" && `v${CURRENT_VERSION}`}
              {updateStatus === "checking" && t("dashboard.checking")}
              {updateStatus === "up-to-date" && t("dashboard.up_to_date")}
              {updateStatus === "available" && `${t("dashboard.update_available")} (v${latestVersion})`}
              {updateStatus === "downloading" && `Downloading... ${downloadProgress}%`}
              {updateStatus === "installing" && "Installing update..."}
            </div>
          </div>
          {updateStatus === "available" && (
             <button 
              onClick={installUpdate}
              className="action-btn-primary"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, marginLeft: "auto", background: "var(--warning)", color: "black" }}
            >
              Update Now
            </button>
          )}
          {(updateStatus === "idle" || updateStatus === "up-to-date") && (
            <button 
              onClick={checkUpdates}
              className="action-btn-primary"
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 11, marginLeft: "auto", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Check
            </button>
          )}
        </div>

        {/* Support Card */}
        <div className="quick-card" style={{ 
          background: "linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(192, 57, 43, 0.1) 100%)",
          border: "1px solid rgba(231, 76, 60, 0.2)"
        }}>
          <div className="quick-card-icon" style={{ background: "rgba(231, 76, 60, 0.2)", color: "#e74c3c" }}>
            <Heart size={20} fill="#e74c3c" />
          </div>
          <div>
            <div className="quick-card-title">{t("dashboard.support_title")}</div>
            <div className="quick-card-desc">
              {t("dashboard.support_desc")}
            </div>
          </div>
          <button 
            onClick={() => openLink("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=segatt22@gmail.com&item_name=Segatt+Tools+Support")}
            className="action-btn-primary"
            style={{ 
              background: "#e74c3c", 
              boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
              fontSize: 12,
              padding: "8px 16px"
            }}
          >
            {t("dashboard.donate_btn")}
          </button>
        </div>

        {/* Connect Section */}
        <div className="quick-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="quick-card-icon" style={{ background: "rgba(100,100,100,0.1)", color: "var(--text-muted)" }}>
            <ExternalLink size={20} />
          </div>
          <div>
            <div className="quick-card-title">{t("dashboard.socials_title")}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button 
                onClick={() => openLink("https://github.com/joshsegatt")}
                title={t("dashboard.github")}
                className="social-icon-btn"
              >
                <Github size={18} />
              </button>
              <button 
                onClick={() => openLink("https://www.instagram.com/josh_segatt")}
                title={t("dashboard.instagram")}
                className="social-icon-btn"
              >
                <Instagram size={18} />
              </button>
              <button 
                onClick={() => openLink("https://www.linkedin.com/in/josh-segat-522760102/?locale=en")}
                title={t("dashboard.linkedin")}
                className="social-icon-btn"
              >
                <Linkedin size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
