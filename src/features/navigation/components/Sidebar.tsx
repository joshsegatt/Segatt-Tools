"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Package, 
  Wrench, 
  Cpu, 
  Eraser, 
  Settings,
  ShieldCheck,
  Github,
  Zap
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const VERSION = "1.7.5";

  const navItems = [
    { label: t("tabs.dashboard"), href: "/", icon: BarChart3 },
    { label: t("tabs.apps"), href: "/install", icon: Package },
    { label: t("tabs.tweaks"), href: "/tweaks", icon: Zap },
    { label: t("tabs.fixes"), href: "/fixes", icon: ShieldCheck },
    { label: t("tabs.management"), href: "/config", icon: Settings },
    { label: t("tabs.cleaner"), href: "/cleaner", icon: Eraser },
  ];

  return (
    <aside className="sidebar-elite glass-panel">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap size={20} fill="var(--accent)" color="var(--accent)" />
        </div>
        <div className="sidebar-brand-text">
          <span className="brand-name">SEGATT</span>
          <span className="brand-tools">ELITE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">{t("sidebar.main_menu")}</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-item-icon">
                <Icon size={18} />
              </div>
              <span className="nav-item-label">{item.label}</span>
              {isActive && <div className="nav-item-glow" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <div className="nav-group-label">{t("sidebar.system")}</div>
        <Link 
          href="/settings"
          className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
        >
          <div className="nav-item-icon">
            <Settings size={18} />
          </div>
          <span className="nav-item-label">{t("tabs.settings")}</span>
        </Link>
        
        <div className="sidebar-version-card glass-panel">
          <div className="version-info">
            <ShieldCheck size={14} className="text-accent" />
            <span>v{VERSION}</span>
          </div>
          <div className="version-status">
            <div className="status-dot animate-pulse" />
            <span>{t("dashboard.privacy_status") || "Protected"}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-elite {
          width: var(--sidebar-width);
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          z-index: 1000;
          user-select: none;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 8px 32px;
        }

        .sidebar-logo {
          width: 36px;
          height: 36px;
          background: var(--accent-dim);
          border: 1px solid var(--border-accent);
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--accent-glow);
        }

        .sidebar-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .brand-name {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .brand-tools {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--accent);
          opacity: 0.8;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-group-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 16px 8px 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          flex-direction: row !important;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--r-md);
          color: var(--text-secondary);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          margin-bottom: 2px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .nav-item.active {
          background: var(--accent-dim);
          border-color: var(--border-accent);
          color: var(--accent);
          font-weight: 700;
          box-shadow: var(--accent-glow);
        }

        .nav-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-item-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 5px var(--accent));
        }

        .nav-item-label {
          font-size: 13px;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .nav-item-glow {
          position: absolute;
          left: 0;
          width: 3px;
          height: 50%;
          background: var(--accent);
          border-radius: 0 4px 4px 0;
          box-shadow: var(--accent-glow);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-version-card {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: rgba(255, 255, 255, 0.01);
          margin-top: 16px;
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .version-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: var(--success);
          opacity: 0.8;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--success);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .text-accent { color: var(--accent); }
      `}</style>
    </aside>
  );
}

function IconWrapper({ icon: Icon, size }: { icon: any, size: number }) {
  return <Icon size={size} />;
}
