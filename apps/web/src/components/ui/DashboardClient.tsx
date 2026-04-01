"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/sidebar";

interface DashboardClientProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardClient({
  children,
  title,
  subtitle,
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F5F1E6" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="px-4 lg:px-8 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(44,26,14,0.08)",
            boxShadow: "0 1px 3px rgba(44,26,14,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Botão hamburguer — só mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: "#2C1A0E" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div>
              <h1
                className="text-lg font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "#A89888" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" style={{ color: "#2C1A0E" }}>
                Bem-vindo
              </p>
              <p className="text-xs" style={{ color: "#A89888" }}>
                Administrador
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: "#2D6A4F" }}
            >
              A
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 p-4 lg:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}
