"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="page-header hero-glow">
      <div className="header-content">
        <div className="header-main">
          <div className="breadcrumb">
            <span className="dot" />
            SYSTEM / {title.toUpperCase()}
          </div>
          <h1>{title}</h1>
          {description && <p className="description">{description}</p>}
        </div>
        {children && <div className="header-actions">{children}</div>}
      </div>

      <style jsx>{`
        .page-header {
          position: relative;
          padding: 40px 0;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--glass-border);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: var(--accent-glow);
        }

        h1 {
          font-family: var(--font-display);
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
          line-height: 1;
        }

        .description {
          margin: 12px 0 0;
          font-size: 15px;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          h1 { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}
