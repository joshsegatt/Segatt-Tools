import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/features/navigation/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Segatt Tools",
  description: "Elite Windows System Utility & AI Optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <div className="app-wrapper">
          <Sidebar />
          <main className="main-content">
            <div className="max-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}



