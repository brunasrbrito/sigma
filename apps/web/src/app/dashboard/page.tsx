"use client";

import { useEffect, useState } from "react";
import DashboardClient from "@/components/ui/DashboardClient";
import api from "@/services/api";

interface DashboardSummary {
  totalStockVolume_m3: number;
  totalStockQuantity: number;
  activeDofs: number;
  speciesCount: number;
  dofAlerts: number;
}

interface ActivityItem {
  type: string;
  date: string;
  description: string;
}

interface DashboardData {
  summary: DashboardSummary;
  latestActivity: ActivityItem[];
}

function badgeStyle(type: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    entrada:        { backgroundColor: "#F0FAF4", color: "#2D6A4F" },
    saida:          { backgroundColor: "#FEF2F2", color: "#DC2626" },
    ajuste:         { backgroundColor: "#EEF4FB", color: "#1D4E89" },
    desmembramento: { backgroundColor: "#FDF6EE", color: "#8B5E3C" },
  };
  return map[type] ?? { backgroundColor: "#F5F1E6", color: "#8B7355" };
}

function labelTipo(type: string): string {
  const map: Record<string, string> = {
    entrada:        "Entrada",
    saida:          "Saída",
    ajuste:         "Ajuste",
    desmembramento: "Desmembramento",
  };
  return map[type] ?? type;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        {
          label: "Estoque Total",
          value: `${Number(data.summary.totalStockVolume_m3).toFixed(2)} m³`,
          description: "volume em estoque",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          ),
          color: "#2D6A4F",
          bg: "#F0FAF4",
        },
        {
          label: "DOFs Ativos",
          value: String(data.summary.activeDofs),
          description: "documentos ativos",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          ),
          color: "#8B5E3C",
          bg: "#FDF6EE",
        },
        {
          label: "Espécies",
          value: String(data.summary.speciesCount),
          description: "tipos de madeira",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          color: "#6B3FA0",
          bg: "#F5F0FB",
        },
        {
          label: "Alertas DOF",
          value: String(data.summary.dofAlerts),
          description: "requerem atenção",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          color: "#DC2626",
          bg: "#FEF2F2",
        },
      ]
    : [];

  return (
    <DashboardClient title="Dashboard" subtitle="Visão geral do sistema">
      {/* Stats */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#8B7355" }}
        >
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(44,26,14,0.07)",
                    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
                  <div>
                    <div className="w-16 h-7 rounded animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
                    <div className="w-20 h-3 rounded mt-1 animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
                  </div>
                  <div className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
                </div>
              ))
            : stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(44,26,14,0.07)",
                    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: stat.bg, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89888" }}>
                      {stat.description}
                    </p>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: stat.color }}>
                    {stat.label}
                  </p>
                </div>
              ))}
        </div>
      </div>

      {/* Atividade Recente */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#8B7355" }}
        >
          Atividade Recente
        </h2>

        {loading ? (
          <div
            className="rounded-2xl p-8 flex items-center justify-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(44,26,14,0.07)",
              boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
              minHeight: "180px",
            }}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#C8A87A", borderTopColor: "transparent" }}
            />
          </div>
        ) : data?.latestActivity && data.latestActivity.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(44,26,14,0.07)",
              boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                    {["Data", "Tipo", "Descrição"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left"
                        style={{ color: "#8B7355" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.latestActivity.map((item, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i < data.latestActivity.length - 1
                            ? "1px solid rgba(44,26,14,0.05)"
                            : "none",
                      }}
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                        {item.date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={badgeStyle(item.type)}
                        >
                          {labelTipo(item.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#2C1A0E" }}>
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(44,26,14,0.07)",
              boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
              minHeight: "180px",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F1E6" }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#C8A87A"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "#2C1A0E" }}>
              Nenhuma atividade registrada ainda
            </p>
            <p className="text-xs" style={{ color: "#A89888" }}>
              As ações do sistema aparecerão aqui
            </p>
          </div>
        )}
      </div>
    </DashboardClient>
  );
}
