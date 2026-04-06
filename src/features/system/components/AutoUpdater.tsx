'use client';

import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Download, RefreshCcw, X, CheckCircle } from 'lucide-react';

export function AutoUpdater() {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'found' | 'downloading' | 'installing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        setStatus('checking');
        const update = await check();
        if (update) {
          setUpdateInfo(update);
          setStatus('found');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
        setStatus('error');
        setError('Updater connection failed.');
      }
    };

    // Initial check
    checkForUpdates();
    
    // Check every 4 hours
    const interval = setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;

    try {
      setStatus('downloading');
      let downloaded = 0;
      let total = 0;

      await updateInfo.downloadAndInstall((event: any) => {
        switch (event.event) {
          case 'Started':
            total = event.data.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (total > 0) {
              setProgress(Math.round((downloaded / total) * 100));
            }
            break;
          case 'Finished':
            setStatus('installing');
            break;
        }
      });

      setStatus('done');
      // Delay to let user see "Finished" before relaunching
      setTimeout(async () => {
        await relaunch();
      }, 2000);
    } catch (err) {
      console.error('Update failed:', err);
      setStatus('error');
      setError('Update failed during installation.');
    }
  };

  if (status === 'idle' || status === 'checking') return null;

  return (
    <div className={`updater-toast glass-panel ${status === 'error' ? 'error' : ''}`}>
      <div className="updater-icon">
        {status === 'found' && <RefreshCcw className="animate-spin-slow" size={18} />}
        {status === 'downloading' && <Download className="animate-bounce" size={18} />}
        {status === 'done' && <CheckCircle className="text-emerald-400" size={18} />}
        {status === 'error' && <X className="text-red-400" size={18} />}
      </div>

      <div className="updater-content">
        <div className="updater-title">
          {status === 'found' && `Nova versão disponível: v${updateInfo.version}`}
          {status === 'downloading' && `Baixando atualização... (${progress}%)`}
          {status === 'installing' && `Instalando e reiniciando...`}
          {status === 'done' && `Atualizado com sucesso! Reiniciando...`}
          {status === 'error' && `Erro na atualização: ${error}`}
        </div>
        
        {status === 'found' && (
          <div className="updater-actions">
            <button className="btn btn-primary btn-sm" onClick={handleUpdate}>
              Atualizar Agora
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStatus('idle')}>
              Depois
            </button>
          </div>
        )}

        {status === 'downloading' && (
          <div className="updater-progress-bar">
            <div className="updater-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <style jsx>{`
        .updater-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          min-width: 320px;
          background: oklch(18% 0.02 240 / 0.95);
          border: 1px solid var(--border-accent);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .updater-toast.error {
          border-color: var(--danger);
        }

        .updater-icon {
          background: var(--accent-dim);
          width: 40px;
          height: 40px;
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .updater-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .updater-title {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
        }

        .updater-actions {
          display: flex;
          gap: 8px;
        }

        .updater-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .updater-progress-fill {
          height: 100%;
          background: var(--accent);
          box-shadow: var(--accent-glow);
          transition: width 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
}
