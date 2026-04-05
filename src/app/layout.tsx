import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/features/navigation/components/TopBar";
import { LanguageProvider } from "@/hooks/useLanguage";

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
      <body>
        <LanguageProvider>
          <div className="app-shell">
            <TopBar />
            <main className="content-area">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
