"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { CloudDownload, CheckCircle, Trash2, Box, Sparkles, Loader2 } from "lucide-react";
import * as webllm from "@mlc-ai/web-llm";

interface Model {
  id: string;
  name: string;
  size: string;
  desc: string;
  isDownloaded: boolean;
}

export const ModelHub = () => {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress]       = useState(0);

  const [models, setModels] = useState<Model[]>([
    { 
      id: "Qwen2.5-0.5B-Instruct-q4f16_1-ML", 
      name: "Qwen 2.5 (0.5B)", 
      size: "390 MB", 
      desc: "Ultra-lightweight & fast. Ideal for hardware summaries.",
      isDownloaded: false 
    },
    { 
      id: "Llama-3.2-1B-Instruct-q4f16_1-ML", 
      name: "Llama 3.2 (1B)", 
      size: "820 MB", 
      desc: "Meta's lightweight powerhouse. Very logical.",
      isDownloaded: false 
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("segatt_downloaded_models");
    if (saved) {
      const ids = JSON.parse(saved) as string[];
      setModels(prev => prev.map(m => ids.includes(m.id) ? { ...m, isDownloaded: true } : m));
    }
  }, []);

  const startDownload = async (modelId: string) => {
    if (downloading) return;
    setDownloading(modelId);
    setProgress(0);

    try {
      // Initialize web-llm engine context just for pre-fetching
      await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report: webllm.InitProgressReport) => {
          const p = Math.round(report.progress * 100);
          setProgress(p);
        }
      });
      const updated = models.map(m => m.id === modelId ? { ...m, isDownloaded: true } : m);
      setModels(updated);
      localStorage.setItem("segatt_downloaded_models", JSON.stringify(updated.filter(m => m.isDownloaded).map(m => m.id)));
    } catch (err) {
      console.error("Download failed:", err);
      alert("Hardware incompatible or download failed. Check WebGPU support.");
    } finally {
      setDownloading(null);
      setProgress(0);
    }
  };

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ background: "var(--accent-dim)", padding: 10, borderRadius: 12, color: "var(--accent)" }}>
          <Box size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Model Hub</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Download neural models for local offline intelligence.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {models.map((model) => (
          <div 
            key={model.id} 
            className="quick-card" 
            style={{ 
              background: "var(--bg-surface)", 
              border: "1px solid var(--border)",
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{model.name}</span>
                <span style={{ fontSize: 10, background: "var(--bg-base)", padding: "2px 6px", borderRadius: 4, color: "var(--text-muted)" }}>{model.size}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, maxWidth: "80%" }}>{model.desc}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {model.isDownloaded ? (
                <div style={{ display: "flex", gap: 8 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--success)", fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={14} /> Ready
                  </div>
                  <button className="social-icon-btn" style={{ color: "var(--danger)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  disabled={downloading !== null}
                  onClick={() => startDownload(model.id)}
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: 100 }}
                >
                  {downloading === model.id ? `${progress}%` : <><CloudDownload size={14} /> {t("common.download") || "Download"}</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: "auto", 
        padding: 16, 
        background: "rgba(var(--accent-rgb), 0.05)", 
        border: "1px solid var(--accent-dim)", 
        borderRadius: 12,
        display: "flex",
        gap: 12
      }}>
        <Sparkles size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          <strong>Pro Tip:</strong> Models are stored locally in your app cache. They use your GPU/NPU for acceleration. No data leaves your machine.
        </p>
      </div>
    </div>
  );
};
