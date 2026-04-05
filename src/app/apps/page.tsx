"use client";

import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Search, 
  Package, 
  ShoppingCart, 
  Loader2,
  Trash2,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { PackageCard } from "@/features/packages/components/PackageCard";
import { TerminalOutput } from "@/features/packages/components/TerminalOutput";

interface PackageInfo {
  name: string;
  id: string;
  version: string;
  source: string;
}

export default function AppsPage() {
  const [query, setQuery] = useState("");
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApps, setSelectedApps] = useState<PackageInfo[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    try {
      const results: PackageInfo[] = await invoke("search_packages", { query });
      setPackages(results);
      if (results.length === 0) {
        setError("Nenhum aplicativo encontrado para este termo.");
      }
    } catch (err: any) {
      console.error("Busca falhou:", err);
      setError(err.toString() || "Falha ao consultar o WinGet. Verifique se ele está instalado.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (pkg: PackageInfo) => {
    setSelectedApps((prev) => {
      const isAlreadySelected = prev.some((a) => a.id === pkg.id);
      if (isAlreadySelected) {
        return prev.filter((a) => a.id !== pkg.id);
      } else {
        return [...prev, pkg];
      }
    });
  };

  const installPackage = async (id: string) => {
    setIsInstalling(true);
    try {
      await invoke("install_package_stream", { packageId: id });
    } catch (err) {
      console.error("Instalação falhou:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  const bulkInstall = async () => {
    setIsInstalling(true);
    for (const app of selectedApps) {
      await installPackage(app.id);
    }
    setSelectedApps([]);
    setIsInstalling(false);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '10px' }}>
            <Package size={14} />
            <span>Infraestrutura de Software</span>
          </div>
          <h1 className="hero-title" style={{ marginBottom: 0 }}>Loja de Apps</h1>
          <p className="hero-description" style={{ marginBottom: 0 }}>
            Sua central de ferramentas de elite. Pesquisa e instalação ultra-rápida via WinGet.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Ex: Discord, Brave..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-soft)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '16px 24px', 
              color: 'white', 
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </form>
      </header>

      {/* Cart Container */}
      {selectedApps.length > 0 && (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ background: 'oklch(65% 0.22 260 / 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedApps.length} Aplicativos selecionados</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pronto para instalação em massa.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setSelectedApps([])}
              style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)', fontSize: '0.85rem', fontWeight: '600' }}
            >
              Limpar
            </button>
            <button 
              onClick={bulkInstall}
              disabled={isInstalling}
              className="button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Instalar Agora {isInstalling && <Loader2 size={18} className="animate-spin" />}
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div style={{ minHeight: '400px' }}>
        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', textAlign: 'center', gap: '16px' }}>
            <AlertCircle size={40} style={{ color: 'oklch(60% 0.15 20)', opacity: 0.5 }} />
            <p style={{ fontWeight: '600' }}>{error}</p>
            <button onClick={() => handleSearch()} style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '700' }}>
              Tentar novamente
            </button>
          </div>
        ) : packages.length > 0 ? (
          <div className="grid-auto">
            {packages.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onInstall={installPackage}
                onSelect={toggleSelect}
                isSelected={selectedApps.some((a) => a.id === pkg.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', border: '2px dashed var(--border-soft)', borderRadius: 'var(--radius-xl)', opacity: 0.4 }}>
            <Package size={64} style={{ marginBottom: '24px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '500' }}>Aguardando comando</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Pesquise por softwares no campo superior</p>
          </div>
        )}
      </div>

      <TerminalOutput />
    </div>
  );
}
