import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/features/navigation/components/Sidebar";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AutoUpdater } from "@/features/system/components/AutoUpdater";

export const metadata: Metadata = {
  title: "Segatt Tools — Elite Windows System Utility",
  description: "Install apps, apply tweaks, and optimize your Windows PC with AI-powered diagnostics. Zero telemetry, privacy-first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="elite-theme">
        <LanguageProvider>
          <div className="app-shell-elite">
            {/* Background Layers */}
            <div className="bg-mesh" />
            <div className="bg-glow bg-glow-primary" />
            <div className="bg-glow bg-glow-secondary" />
            
            <Sidebar />
            
            <main className="content-area-elite">
              {children}
            </main>

            <AutoUpdater />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
