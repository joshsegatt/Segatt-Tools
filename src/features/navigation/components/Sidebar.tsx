"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Cpu,
  Info
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Aplicativos", href: "/apps" },
  { icon: Wrench, label: "Ajustes", href: "/tweaks" },
  { icon: Cpu, label: "IA & Diagnóstico", href: "/ai" },
];

export const Sidebar = () => {
  const pathname = usePathname();

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
      </nav>

      <div className="sidebar-footer" style={{ padding: '24px', borderTop: '1px solid var(--border-soft)', marginTop: 'auto' }}>
        <button className="nav-link" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent' }}>
          <Info size={18} style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Sobre o Segatt</span>
        </button>
      </div>
    </aside>
  );
};
