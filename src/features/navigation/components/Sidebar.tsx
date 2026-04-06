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
  const VERSION = "1.7.6";

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
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <span className="nav-item-label">{item.label}</span>
              {isActive && <div className="nav-item-active-bar" />}
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
            <Settings size={20} strokeWidth={2.5} />
          </div>
          <span className="nav-item-label">{t("tabs.settings")}</span>
        </Link>
        
        <div className="sidebar-version-card glass-panel">
          <div className="version-info">
            <ShieldCheck size={14} className="text-accent" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>v{VERSION}</span>
            <span className="elite-badge">ELITE</span>
          </div>
          <div className="version-status">
            <div className="status-dot animate-pulse" />
            <span>{t("sidebar.update_winget") || "Update via Winget"}</span>
          </div>
        </div>

      </div>

      <style jsx>{`
        .sidebar-elite {
          width: var(--sidebar-width);
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--glass-border);
          z-index: 1000;
          user-select: none;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 8px 40px;
        }

        .sidebar-logo {
          width: 40px;
          height: 40px;
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
          line-height: 1;
        }

        .brand-name {
          font-family: var(--font-display);
          font-weight: 950;
          font-size: 20px;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .brand-tools {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          color: var(--accent);
          opacity: 0.9;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-group-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 12px 8px 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: var(--r-md);
          color: var(--text-secondary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          border-color: var(--glass-border);
          color: var(--text-primary);
          padding-left: 22px;
        }

        .nav-item.active {
          background: var(--accent-dim);
          border-color: var(--border-accent);
          color: var(--text-primary);
          box-shadow: var(--accent-glow), inset 0 0 10px rgba(255,255,255,0.02);
        }

        .nav-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          transition: transform 0.2s ease;
        }

        .nav-item.active .nav-item-icon {
          color: var(--accent);
          filter: drop-shadow(0 0 8px var(--accent));
          transform: scale(1.1);
        }

        .nav-item-label {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .nav-item-active-bar {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 4px;
          background: var(--accent);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 15px var(--accent);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
        }

        .sidebar-version-card {
          padding: 16px;
          border-radius: var(--r-lg);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-color: oklch(100% 0 0 / 0.05);
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .version-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--success);
          font-weight: 600;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--success);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        .text-accent { color: var(--accent); }

        .elite-badge {
          font-size: 8px;
          background: var(--accent);
          color: black;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 900;
          margin-left: 4px;
        }
      `}</style>
    </aside>
  );
}

function IconWrapper({ icon: Icon, size }: { icon: any, size: number }) {
  return <Icon size={size} />;
}
