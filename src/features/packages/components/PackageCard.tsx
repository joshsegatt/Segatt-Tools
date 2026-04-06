"use client";

import React, { useState } from "react";
import { 
  Download, 
  CheckCircle2, 
  Plus, 
  Minus,
  Package as PackageIcon
} from "lucide-react";

interface PackageCardProps {
  pkg: any;
  onInstall: (id: string) => void;
  onSelect: (pkg: any) => void;
  isSelected: boolean;
}

export const PackageCard = ({ pkg, onInstall, onSelect, isSelected }: PackageCardProps) => {
  return (
    <div className={`package-card-elite glass-panel ${isSelected ? "selected" : ""}`}>
      <div className="package-card-header">
        <div className="package-icon-box">
          <PackageIcon size={24} strokeWidth={1.5} />
        </div>
        <button 
          onClick={() => onSelect(pkg)}
          className={`select-toggle ${isSelected ? "active" : ""}`}
        >
          {isSelected ? <Minus size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="package-card-body">
        <h3 className="package-title">{pkg.name}</h3>
        <p className="package-id">ID: {pkg.id}</p>
      </div>

      <div className="package-card-footer">
        <div className="package-meta">
          <span className="meta-label">Versão</span>
          <span className="meta-value">{pkg.version}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInstall(pkg.id); }}
          className="install-button-elite"
          title="Instalar Agora"
        >
          <Download size={18} />
        </button>
      </div>

      {isSelected && (
        <div className="selection-badge">
          <CheckCircle2 size={12} />
        </div>
      )}

      <style jsx>{`
        .package-card-elite {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid var(--glass-border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: rgba(255, 255, 255, 0.01);
          min-height: 180px;
        }

        .package-card-elite:hover {
          background: var(--bg-hover);
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        .package-card-elite.selected {
          background: var(--accent-dim);
          border-color: var(--accent);
          box-shadow: var(--accent-glow);
        }

        .package-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .package-icon-box {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--r-md);
          color: var(--accent);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .select-toggle {
          padding: 8px;
          border-radius: var(--r-sm);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-toggle.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 0 10px var(--accent);
        }

        .package-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .package-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .package-id {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          opacity: 0.7;
        }

        .package-card-footer {
          margin-top: auto;
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .package-meta {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .install-button-elite {
          padding: 10px;
          border-radius: var(--r-md);
          background: var(--accent);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        .install-button-elite:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
          box-shadow: var(--accent-glow);
        }

        .selection-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          padding: 4px;
          box-shadow: 0 0 15px var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
