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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-primary uppercase tracking-[0.2em] text-[10px] font-bold">
            <Package size={14} />
            <span>Infraestrutura de Software</span>
          </div>
          <h1 className="hero-title mb-0">Loja de Apps</h1>
          <p className="text-text-secondary max-w-lg">
            Sua central de ferramentas de elite. Pesquisa e instalação ultra-rápida via WinGet.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <input 
            type="text" 
            placeholder="Ex: Discord, Brave, VS Code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-soft rounded-2xl px-6 py-4 outline-none focus:border-accent-primary focus:bg-white/10 transition-all font-medium text-sm pr-12 group-hover:bg-white/10"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent-primary transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </form>
      </header>

      {/* Cart Container */}
      {selectedApps.length > 0 && (
        <div className="glass p-6 rounded-3xl border-accent-primary/20 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-4 shadow-[0_0_50px_rgba(100,150,255,0.08)]">
          <div className="flex items-center gap-6">
            <div className="bg-accent-primary/20 p-4 rounded-2xl text-accent-primary">
              <ShoppingCart size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-lg">{selectedApps.length} Apps na fila</h2>
              <p className="text-xs text-text-muted">Pronto para instalação em massa.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedApps([])}
              className="px-6 py-3 rounded-xl border border-soft text-text-secondary hover:bg-white/5 transition-all text-sm font-semibold flex items-center gap-2"
            >
              <Trash2 size={16} /> Limpar
            </button>
            <button 
              onClick={bulkInstall}
              disabled={isInstalling}
              className="button-primary flex items-center gap-2 px-8 py-3 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              Iniciar Instalação {isInstalling ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center justify-center p-20 border border-soft rounded-3xl bg-white/[0.02] text-center space-y-4">
            <AlertCircle size={40} className="text-accent-error opacity-50" />
            <div className="space-y-1">
              <p className="font-semibold text-text-secondary">{error}</p>
              <p className="text-sm text-text-muted">Tente um termo diferente ou verifique sua conexão.</p>
            </div>
            <button 
              onClick={() => handleSearch()}
              className="flex items-center gap-2 text-accent-primary text-sm font-bold hover:underline"
            >
              <RefreshCw size={14} /> Tentar novamente
            </button>
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-soft rounded-[2.5rem] opacity-40">
            <Package size={64} className="mb-6 text-text-muted" />
            <h3 className="text-xl font-display font-medium text-text-secondary">Aguardando seu comando</h3>
            <p className="text-sm text-text-muted mt-2">Pesquise por qualquer software no topo da página.</p>
          </div>
        )}
      </div>

      <TerminalOutput />
    </div>
  );
}
