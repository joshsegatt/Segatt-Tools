"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Download, 
  Star, 
  GitFork, 
  TrendingUp, 
  ShieldAlert,
  ArrowLeft,
  RefreshCw 
} from "lucide-react";
import Link from "next/link";

interface GithubStats {
  total_downloads: number;
  stars: number;
  forks: number;
  releases: {
    tag: string;
    downloads: number;
  }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await fetch("https://api.github.com/repos/joshsegatt/Segatt-Tools/releases");
      const releases = await resp.json();
      
      const repoResp = await fetch("https://api.github.com/repos/joshsegatt/Segatt-Tools");
      const repoData = await repoResp.json();

      let total = 0;
      const releaseStats = releases.map((r: any) => {
        const count = r.assets.reduce((acc: number, a: any) => acc + a.download_count, 0);
        total += count;
        return { tag: r.tag_name, downloads: count };
      });

      setStats({
        total_downloads: total,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        releases: releaseStats
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080808]">
        <RefreshCw className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: 24, height: "100vh", overflowY: "auto", background: "#080808" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <Link href="/">
          <div className="social-icon-btn">
            <ArrowLeft size={18} />
          </div>
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Elite Admin Dashboard
        </h1>
        <div style={{ 
          background: "rgba(231, 76, 60, 0.1)", 
          color: "#e74c3c", 
          padding: "4px 12px", 
          borderRadius: 20, 
          fontSize: 10, 
          fontWeight: 800,
          textTransform: "uppercase" 
        }}>
          Developer Only
        </div>
      </div>

      <div className="quick-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="stat-label">
            <Users size={14} /> Total Users (Est.)
          </div>
          <div className="stat-value" style={{ fontSize: 32, color: "var(--accent)" }}>
            {stats?.total_downloads.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Based on direct downloads
          </div>
        </div>

        <div className="stat-card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="stat-label">
            <Star size={14} /> Repo Stars
          </div>
          <div className="stat-value" style={{ fontSize: 32, color: "var(--warning)" }}>
            {stats?.stars}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            GitHub Community Support
          </div>
        </div>

        <div className="stat-card" style={{ padding: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="stat-label">
            <GitFork size={14} /> Total Forks
          </div>
          <div className="stat-value" style={{ fontSize: 32, color: "var(--success)" }}>
            {stats?.forks}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Project contributions
          </div>
        </div>
      </div>

      <div style={{ 
        background: "rgba(255,255,255,0.02)", 
        borderRadius: 12, 
        padding: 24, 
        border: "1px solid rgba(255,255,255,0.05)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14, fontWeight: 700 }}>
          <TrendingUp size={16} /> Release Performance
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats?.releases.map((release) => (
            <div key={release.tag} style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8
            }}>
              <span style={{ fontWeight: 600 }}>{release.tag}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Download size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{release.downloads}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: 32, 
        display: "flex", 
        alignItems: "center", 
        gap: 8, 
        color: "var(--danger)", 
        fontSize: 11, 
        opacity: 0.6 
      }}>
        <ShieldAlert size={12} />
        This panel is hidden from standard users. Zero telemetry policy maintained.
      </div>
    </div>
  );
}
