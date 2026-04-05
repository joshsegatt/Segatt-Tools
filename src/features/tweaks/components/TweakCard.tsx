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
      className={`
        glass p-5 rounded-2xl cursor-pointer transition-all duration-300 border
        ${isSelected ? "border-accent-primary bg-accent-primary/5 shadow-lg" : "border-soft hover:bg-white/5"}
        group relative
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2.5 rounded-xl transition-colors
          ${isSelected ? "bg-accent-primary text-white" : "bg-white/5 text-text-muted group-hover:text-text-secondary"}
        `}>
          <CategoryIcon category={tweak.category} />
        </div>
        
        <div className={`transition-colors ${isSelected ? "text-accent-primary" : "text-text-muted"}`}>
          {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-sm tracking-tight group-hover:text-accent-primary transition-colors">
          {tweak.name}
        </h3>
        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
          {tweak.description}
        </p>
      </div>

      {isApplied && (
        <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase font-bold text-accent-primary tracking-widest animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
          Aplicado
        </div>
      )}
    </div>
  );
};
