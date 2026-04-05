"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  Wrench,
  Cpu,
  RefreshCw,
  Globe,
  Info,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/" },
  { icon: Trash2,          label: "Cleaner",    href: "/cleaner" },
  { icon: Package,         label: "Install",     href: "/install" },
  { icon: Wrench,          label: "Tweaks",      href: "/tweaks" },
  { icon: Cpu,             label: "AI",          href: "/ai" },
];

interface TopBarProps {
  onUpgradeAll?: () => void;
  isUpgrading?: boolean;
}

export const TopBar = ({ onUpgradeAll, isUpgrading }: TopBarProps) => {
  const pathname = usePathname();

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <span className="topbar-brand-name">SEGATT</span>
        <span className="topbar-brand-badge">v1.0</span>
      </div>

      <div className="topbar-divider" />

      {/* Tabs */}
      <nav className="tab-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={15} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="topbar-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onUpgradeAll}
          disabled={isUpgrading}
          aria-label="Upgrade all installed packages"
          title="Upgrade all installed packages via WinGet"
        >
          <RefreshCw size={13} className={isUpgrading ? "animate-spin" : ""} />
          Upgrade All
        </button>

        <Link
          href="/ai"
          className="btn btn-ghost btn-sm"
          title="About Segatt Tools"
        >
          <Info size={13} />
        </Link>
      </div>
    </header>
  );
};
