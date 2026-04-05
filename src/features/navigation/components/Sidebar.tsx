"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  ShieldCheck, 
  Settings, 
  Cpu,
  Info
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Aplicativos", href: "/apps" },
  { icon: Wrench, label: "Ajustes", href: "/tweaks" },
  { icon: ShieldCheck, label: "Segurança", href: "/security" },
  { icon: Cpu, label: "IA & Diagnóstico", href: "/ai" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="glass w-64 h-full flex flex-col border-r border-soft">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight font-display bg-gradient-to-br from-white to-text-muted bg-clip-text text-transparent">
          SEGATT
        </h1>
        <p className="text-xs text-text-muted font-medium tracking-widest mt-1">
          SYSTEM UTILITY
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? "bg-accent-primary text-white shadow-[0_0_20px_rgba(100,150,255,0.3)]" 
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon 
                size={20} 
                className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-accent-primary"}`} 
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-soft">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-text-muted hover:text-white transition-colors text-sm font-medium group">
          <Info size={18} className="group-hover:text-accent-secondary transition-colors" />
          <span>Sobre o Segatt</span>
        </button>
      </div>

      <style jsx>{`
        .glass {
          background: var(--bg-surface);
          backdrop-filter: blur(20px) saturate(180%);
          border-right: 1px solid var(--border-soft);
        }
      `}</style>
    </aside>
  );
};
