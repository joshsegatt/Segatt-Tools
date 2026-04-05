"use client";

import React, { useState } from "react";
import { 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Minus,
  Package as PackageIcon
} from "lucide-react";

interface PackageInfo {
  name: String;
  id: String;
  version: String;
  source: String;
}

interface PackageCardProps {
  pkg: any;
  onInstall: (id: string) => void;
  onSelect: (pkg: any) => void;
  isSelected: boolean;
}

export const PackageCard = ({ pkg, onInstall, onSelect, isSelected }: PackageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`
        glass p-6 rounded-2xl transition-all duration-300 relative group
        ${isSelected ? "border-accent-primary bg-accent-primary/5 shadow-lg" : "hover:bg-white/5"}
        ${isHovered ? "-translate-y-1" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5 text-accent-primary group-hover:scale-110 transition-transform duration-300">
          <PackageIcon size={24} />
        </div>
        <button 
          onClick={() => onSelect(pkg)}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isSelected ? "bg-accent-primary text-white" : "bg-white/5 text-text-muted hover:text-white"}
          `}
        >
          {isSelected ? <Minus size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold text-lg truncate pr-2 group-hover:text-accent-primary transition-colors">
          {pkg.name}
        </h3>
        <p className="text-xs text-text-muted font-mono tracking-tighter truncate">
          ID: {pkg.id}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Versão</span>
          <span className="text-sm font-medium text-text-secondary">{pkg.version}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInstall(pkg.id); }}
          className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all duration-300"
          title="Instalar Agora"
        >
          <Download size={18} />
        </button>
      </div>

      {isSelected && (
        <div className="absolute -top-1 -right-1">
          <div className="bg-accent-primary p-1 rounded-full text-white shadow-xl">
            <CheckCircle2 size={12} />
          </div>
        </div>
      )}
    </div>
  );
};
