"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Zap, 
  Shield, 
  CheckCircle2, 
  Loader2,
  RotateCcw,
  AlertTriangle,
  Play,
  ShieldAlert,
  Info
} from "lucide-react";
import { TweakCard } from "@/features/tweaks/components/TweakCard";

interface Tweak {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function TweaksPage() {
  const [allTweaks, setAllTweaks] = useState<Tweak[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("Privacidade");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info", message: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [tweaksRes, adminRes] = await Promise.all([
          invoke("get_tweaks") as Promise<Tweak[]>,
          invoke("check_admin") as Promise<boolean>
        ]);
        setAllTweaks(tweaksRes);
        setIsAdmin(adminRes);
      } catch (err: any) {
        setNotification({ type: "error", message: "Erro ao inicializar motor de tweaks." });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateRestorePoint = async () => {
    setNotification({ type: "info", message: "Iniciando criação do ponto de restauração..." });
    try {
      const msg: string = await invoke("create_restore_point");
      setNotification({ type: "success", message: msg });
    } catch (err: any) {
      setNotification({ type: "error", message: err.toString() });
    }
  };

  const handleApplyTweaks = async () => {
    if (!isAdmin) {
      setNotification({ type: "error", message: "Você precisa de privilégios de Administrador para aplicar tweaks." });
      return;
    }

    setIsApplying(true);
    let successCount = 0;
    
    for (const id of selectedIds) {
      try {
        await invoke("apply_tweak", { id });
        successCount++;
      } catch (err: any) {
        console.error(`Falha no tweak ${id}:`, err);
      }
    }

    setIsApplying(false);
    setNotification({ 
      type: "success", 
      message: `${successCount} ajustes aplicados com sucesso!` 
    });
    setSelectedIds([]);
  };

  const categories = ["Privacidade", "Performance", "Interface", "Sistema"];
  const filteredTweaks = allTweaks.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.2em] text-[10px] font-bold">
            <Zap size={14} />
            <span>Optimization Engine v2.0</span>
          </div>
          <h1 className="hero-title mb-0">Ajustes de Sistema</h1>
          <p className="text-text-secondary max-w-lg">
            Modificações de baixo nível para máxima performance. Execute como Administrador para total eficácia.
          </p>
        </div>

        <button 
          onClick={handleCreateRestorePoint}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-soft rounded-2xl hover:bg-white/10 transition-all text-sm font-semibold group disabled:opacity-50"
        >
          <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
          Segurança: Ponto de Restauração
        </button>
      </header>

      {/* Admin Warning Banner */}
      {isAdmin === false && (
        <div className="glass p-5 rounded-3xl border-accent-error/20 bg-accent-error/5 flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="p-3 bg-accent-error/20 rounded-2xl text-accent-error">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Privilégios Insuficientes</h4>
            <p className="text-xs text-text-muted">Alguns tweaks de registro requerem permissão de Administrador para serem aplicados.</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <nav className="flex flex-wrap gap-2 p-1.5 glass rounded-2xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeCategory === cat ? "bg-accent-primary text-white shadow-xl" : "text-text-muted hover:text-text-secondary"}
            `}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-soft" />
          ))
        ) : (
          filteredTweaks.map((tweak) => (
            <TweakCard 
              key={tweak.id}
              tweak={tweak}
              isSelected={selectedIds.includes(tweak.id)}
              onToggle={() => handleToggle(tweak.id)}
            />
          ))
        )}
      </div>

      {/* Feedback Notifications */}
      {notification && (
        <div className={`
          fixed top-8 right-8 z-[100] glass p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right-10 shadow-2xl
          ${notification.type === "success" ? "border-accent-primary/20 text-accent-primary" : 
            notification.type === "info" ? "border-white/20 text-text-primary" : "border-accent-error/20 text-accent-error"}
        `}>
          {notification.type === "success" ? <CheckCircle2 size={20} /> : 
           notification.type === "info" ? <Info size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Global Processing Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 glass p-6 rounded-3xl border-accent-primary/30 shadow-[0_0_80px_rgba(100,150,255,0.15)] flex items-center gap-12 z-50 animate-in slide-in-from-bottom-10">
          <div className="space-y-1">
            <h4 className="font-bold text-lg">{selectedIds.length} Alterações Planejadas</h4>
            <div className="flex gap-1.5">
              {selectedIds.slice(0, 3).map(id => (
                <div key={id} className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              ))}
              {selectedIds.length > 3 && <span className="text-[10px] text-text-muted">...</span>}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedIds([])}
              className="px-6 py-3 rounded-xl border border-soft hover:bg-white/5 transition-all text-sm font-semibold"
            >
              Descartar
            </button>
            <button 
              onClick={handleApplyTweaks}
              disabled={isApplying}
              className="button-primary flex items-center gap-3 px-10 py-3 !rounded-xl !animate-none disabled:opacity-50 font-bold group"
            >
              {isApplying ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              Executar Modificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
