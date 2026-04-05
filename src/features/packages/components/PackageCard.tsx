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
    <div 
      className={`card-elite ${isSelected ? "selected" : ""}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-soft)',
        backgroundColor: isSelected ? 'oklch(65% 0.22 260 / 0.05)' : 'var(--bg-surface)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--border-subtle)', color: 'var(--accent-primary)' }}>
          <PackageIcon size={24} />
        </div>
        <button 
          onClick={() => onSelect(pkg)}
          style={{ 
            padding: '8px', 
            borderRadius: 'var(--radius-sm)', 
            background: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
            color: isSelected ? 'white' : 'var(--text-muted)'
          }}
        >
          {isSelected ? <Minus size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pkg.name}
        </h3>
        <p className="text-label" style={{ fontSize: '10px', textTransform: 'none', letterSpacing: '0' }}>
          ID: {pkg.id}
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="text-label" style={{ fontSize: '9px' }}>Versão</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{pkg.version}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInstall(pkg.id); }}
          className="button-primary"
          style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
          title="Instalar Agora"
        >
          <Download size={18} />
        </button>
      </div>

      {isSelected && (
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <CheckCircle2 size={12} />
        </div>
      )}
    </div>
  );
};
