"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Cpu,
  Info,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

export const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [clicks, setClicks] = useState(0);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const handleVersionClick = () => {
    const newClicks = clicks + 1;
    if (newClicks >= 7) {
      setIsAdminUnlocked(true);
    }
    setClicks(newClicks);
  };

  const navItems = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), href: "/" },
    { icon: Package, label: t("nav.install"), href: "/install" },
    { icon: Wrench, label: t("nav.tweaks"), href: "/tweaks" },
    { icon: Cpu, label: t("nav.ai"), href: "/ai" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="hero-title" style={{ fontSize: '1.5rem', marginBottom: '0' }}>
          SEGATT
        </h1>
        <p className="text-label" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>
          SYSTEM UTILITY
        </p>
      </div>

      <nav className="nav-group">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon 
                size={20} 
                className="icon-transition"
                style={{ 
                  color: isActive ? 'white' : 'var(--accent-primary)',
                  transition: 'color 0.3s'
                }}
              />
              <span style={{ fontWeight: isActive ? '700' : '600' }}>{item.label}</span>
            </Link>
          );
        })}

        {isAdminUnlocked && (
           <Link
            href="/admin"
            className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
            style={{ marginTop: 12, border: "1px dashed var(--accent-primary)", borderRadius: 8 }}
          >
            <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: "700", color: "var(--accent)" }}>Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer" style={{ padding: '24px', borderTop: '1px solid var(--border-soft)', marginTop: 'auto' }}>
        <button className="nav-link" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent' }}>
          <Info size={18} style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Sobre o Segatt</span>
        </button>
        
        <div 
          onClick={handleVersionClick}
          style={{ 
            marginTop: 12, 
            fontSize: 10, 
            color: "var(--text-muted)", 
            cursor: "pointer",
            userSelect: "none",
            textAlign: "center"
          }}
        >
          Build v1.4.0 • Senior Elite
        </div>
      </div>
    </aside>
  );
};
