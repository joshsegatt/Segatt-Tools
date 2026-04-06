"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function PageHeader({ title, description, children, compact = false }: PageHeaderProps) {
  return (
    <div className={`page-header ${compact ? 'compact' : ''} hero-glow`}>
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
          padding: ${compact ? '16px 0 12px' : '40px 0'};
          margin-bottom: ${compact ? '16px' : '32px'};
          border-bottom: 1px solid var(--glass-border);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: ${compact ? 'center' : 'flex-end'};
          gap: 24px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin-bottom: ${compact ? '4px' : '12px'};
          opacity: 0.8;
        }

        .dot {
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: var(--accent-glow);
        }

        h1 {
          font-family: var(--font-display);
          font-size: ${compact ? '28px' : '40px'};
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
          line-height: 1;
        }

        .description {
          margin: ${compact ? '4px 0 0' : '12px 0 0'};
          font-size: ${compact ? '13px' : '15px'};
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.5;
          opacity: 0.8;
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
          
          h1 { font-size: ${compact ? '24px' : '32px'}; }
        }
      `}</style>
    </div>
  );
}
