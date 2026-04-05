"use client";

import React from "react";
import { 
  Shield, 
  Zap, 
  Settings, 
  Layout,
  CheckCircle2,
  Circle
} from "lucide-react";

interface Tweak {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TweakCardProps {
  tweak: Tweak;
  isSelected: boolean;
  onToggle: () => void;
  isApplied?: boolean;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category.toLowerCase()) {
    case "privacidade": return <Shield size={18} />;
    case "performance": return <Zap size={18} />;
    case "interface": return <Layout size={18} />;
    default: return <Settings size={18} />;
  }
};

export const TweakCard = ({ tweak, isSelected, onToggle, isApplied }: TweakCardProps) => {
  return (
    <div 
      onClick={onToggle}
      className={`card-elite ${isSelected ? "selected" : ""}`}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-soft)',
        backgroundColor: isSelected ? 'oklch(65% 0.22 260 / 0.05)' : 'var(--bg-surface)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ 
          padding: '10px', 
          borderRadius: 'var(--radius-md)', 
          background: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
          color: isSelected ? 'white' : 'var(--text-muted)',
          transition: 'all 0.3s'
        }}>
          <CategoryIcon category={tweak.category} />
        </div>
        
        <div style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
          {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {tweak.name}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tweak.description}
        </p>
      </div>

      {isApplied && (
        <div style={{ 
          marginTop: 'auto',
          paddingTop: '8px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '9px', 
          textTransform: 'uppercase', 
          fontWeight: '800', 
          color: 'var(--accent-primary)', 
          letterSpacing: '0.1em'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
          Aplicado
        </div>
      )}
    </div>
  );
};
