"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface DofSummary {
  speciesCount: number;
  conformingCount: number;
  warningCount: number;
  irregularCount: number;
  totalCubagem_m3: number;
  totalDof_m3: number;
  activeDofs: number;
}

interface SpeciesItem {
  common_name: string | null;
  scientific_name: string | null;
  totalCubagem_m3: number;
  totalDof_m3: number;
  difference_m3: number;
  divergence_pct: number;
  status: "conforme" | "atencao" | "irregular";
  activeDofs: number;
}

interface DofData {
  summary: DofSummary;
  species: SpeciesItem[];
}

function badgeStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    conforme:  { backgroundColor: "#DCFCE7", color: "#166534" },
    atencao:   { backgroundColor: "#FEF9C3", color: "#854D0E" },
    irregular: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  };
  return map[status] ?? { backgroundColor: "#F5F1E6", color: "#8B7355" };
}

function labelStatus(status: string): string {
  const map: Record<string, string> = {
    conforme:  "Conforme",
    atencao:   "Em atenção",
    irregular: "Irregular",
  };
  return map[status] ?? status;
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "1rem",
  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  border: "1px solid rgba(44,26,14,0.07)",
};

export default function DofPage() {
  const [data, setData] = useState<DofData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dof")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Espécies Conformes",
      value: data?.summary.conformingCount,
      color: "#2D6A4F",
      bg: "#F0FAF4",
    },
    {
      label: "Em Atenção",
      value: data?.summary.warningCount,
      color: "#B45309",
      bg: "#FFFBEB",
    },
    {
      label: "Irregulares",
      value: data?.summary.irregularCount,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
  ];

  return (
    <DashboardClient title="Controle DOF" subtitle="Conformidade de volume por espécie">
      <div className="space-y-6">
        {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="p-5 flex flex-col gap-2" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>
              {card.label}
            </p>
            {loading ? (
              <div className="w-16 h-7 rounded animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
                {card.value ?? "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={cardStyle}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: "#E2D9CE", borderTopColor: "#2D6A4F" }}
            />
          </div>
        ) : data === null ? (
          <div className="text-center py-12" style={{ color: "#DC2626" }}>
            <p className="text-sm">Não foi possível carregar os dados. Tente novamente.</p>
          </div>
        ) : data.species.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#A89888" }}>
            <p className="text-sm">Nenhuma espécie cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                  {[
                    "Espécie",
                    "Vol. Estoque (m³)",
                    "Vol. DOF (m³)",
                    "Diferença (m³)",
                    "Divergência (%)",
                    "Status",
                  ].map((h) => (
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
                {data.species.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < data.species.length - 1
                          ? "1px solid rgba(44,26,14,0.05)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: "#2C1A0E" }}>
                      <span className="font-medium">{row.common_name ?? "—"}</span>
                      {row.scientific_name && (
                        <span className="block text-xs italic" style={{ color: "#8B7355" }}>
                          {row.scientific_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {Number(row.totalCubagem_m3).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {Number(row.totalDof_m3).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {Number(row.difference_m3).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {Number(row.divergence_pct).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={badgeStyle(row.status)}
                      >
                        {labelStatus(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </DashboardClient>
  );
}
