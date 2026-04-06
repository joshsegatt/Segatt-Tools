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
      className={`tweak-card-elite glass-panel ${isSelected ? "selected" : ""} ${isApplied ? "applied" : ""}`}
    >
      <div className="tweak-card-header">
        <div className="tweak-icon-box">
          <CategoryIcon category={tweak.category} />
        </div>
        
        <div className="tweak-selector">
          {isSelected ? (
            <CheckCircle2 size={18} className="text-accent" strokeWidth={3} />
          ) : (
            <Circle size={18} className="text-muted" strokeWidth={2} />
          )}
        </div>
      </div>

      <div className="tweak-card-body">
        <h3 className="tweak-title">{tweak.name}</h3>
        <p className="tweak-desc">{tweak.description}</p>
      </div>

      {isApplied && (
        <div className="tweak-applied-badge">
          <div className="applied-dot" />
          <span>Active</span>
        </div>
      )}

      <style jsx>{`
        .tweak-card-elite {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--glass-border);
          position: relative;
          background: rgba(255, 255, 255, 0.01);
          min-height: 140px;
        }

        .tweak-card-elite:hover {
          background: var(--bg-hover);
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .tweak-card-elite.selected {
          background: var(--accent-dim);
          border-color: var(--accent);
          box-shadow: var(--accent-glow);
        }

        .tweak-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tweak-icon-box {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--r-md);
          color: var(--text-muted);
          transition: all 0.3s;
        }

        .selected .tweak-icon-box {
          background: var(--accent);
          color: white;
          box-shadow: 0 0 15px var(--accent);
        }

        .tweak-card-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tweak-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .tweak-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tweak-applied-badge {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.1em;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .applied-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent);
        }

        .text-accent { color: var(--accent); }
        .text-muted { color: var(--text-muted); }
      `}</style>
    </div>
  );
};
