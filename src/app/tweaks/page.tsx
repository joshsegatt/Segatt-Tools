"use client";

import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Zap, 
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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '120px' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '10px' }}>
            <Zap size={14} />
            <span>Optimization Engine v2.0</span>
          </div>
          <h1 className="hero-title" style={{ marginBottom: 0 }}>Ajustes de Sistema</h1>
          <p className="hero-description" style={{ marginBottom: 0 }}>
            Modificações de baixo nível para máxima performance. Execute como Admin para total eficácia.
          </p>
        </div>

        <button 
          onClick={handleCreateRestorePoint}
          className="glass"
          style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '600' }}
        >
          <RotateCcw size={16} /> Segurança: Ponto de Restauração
        </button>
      </header>

      {isAdmin === false && (
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-xl)', borderColor: 'rgba(255, 50, 50, 0.2)', backgroundColor: 'rgba(255, 50, 50, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 50, 50, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'oklch(60% 0.15 20)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Privilégios Insuficientes</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alguns tweaks requerem permissão de Administrador para serem aplicados.</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <nav className="glass" style={{ padding: '6px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', width: 'fit-content' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: activeCategory === cat ? 'var(--accent-primary)' : 'transparent',
              color: activeCategory === cat ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="grid-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-elite" style={{ height: '160px', opacity: 0.3 }} />
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

      {/* Global Processing Bar */}
      {selectedIds.length > 0 && (
        <div className="glass fade-in" style={{ 
          position: 'fixed', 
          bottom: '48px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          padding: '24px 40px', 
          borderRadius: 'var(--radius-2xl)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          boxShadow: '0 30px 100px rgba(100, 150, 255, 0.2)',
          borderColor: 'var(--accent-primary)'
        }}>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedIds.length} Alterações Planejadas</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revise antes de executar modificações no registro.</p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setSelectedIds([])}
              style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)', fontSize: '0.85rem', fontWeight: '600' }}
            >
              Descartar
            </button>
            <button 
              onClick={handleApplyTweaks}
              disabled={isApplying}
              className="button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 40px' }}
            >
              {isApplying ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              Executar Modificações
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div className="glass fade-in" style={{ 
          position: 'fixed', top: '32px', right: '32px', zIndex: 2000, padding: '16px 24px', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '16px',
          borderColor: notification.type === 'success' ? 'var(--accent-primary)' : 'rgba(255,50,50,0.3)',
          color: notification.type === 'success' ? 'var(--accent-primary)' : 'oklch(60% 0.15 20)'
        }}>
          {notification.type === "success" ? <CheckCircle2 size={20} /> : 
           notification.type === "info" ? <Info size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
