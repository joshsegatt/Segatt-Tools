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
import { useLanguage } from "@/hooks/useLanguage";

export const TopBar = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const TABS = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), href: "/" },
    { icon: Trash2, label: t("nav.cleaner"), href: "/cleaner" },
    { icon: Package, label: t("nav.install"), href: "/install" },
    { icon: Wrench, label: t("nav.tweaks"), href: "/tweaks" },
    { icon: Cpu, label: t("nav.ai"), href: "/ai" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <span className="topbar-brand-name">SEGATT</span>
        <span className="topbar-brand-badge" style={{ color: "var(--accent)" }}>
          v1.3.0
        </span>
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
          className="btn btn-ghost btn-sm"
          onClick={toggleLanguage}
          title={language === "pt" ? "Mudar para Inglês" : "Change to Portuguese"}
          style={{ gap: 6 }}
        >
          <Globe size={13} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
            {language}
          </span>
        </button>

        <div className="topbar-divider" style={{ height: 16 }} />

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
