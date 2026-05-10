"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface LotItem {
  id: number;
  productId: number;
  quantity: number;
  volume_m3: number;
  product?: {
    wood_type: string;
    common_name?: string;
    unit_volume_m3: number;
  };
}

interface Lot {
  id: number;
  dofNumber: string;
  supplierId: number;
  supplier?: { id: number; name: string };
  entryDate: string;
  items: LotItem[];
}

function totalVolume(items: LotItem[]): string {
  return items.reduce((acc, i) => acc + (i.volume_m3 ?? 0), 0).toFixed(4);
}

export default function LotesPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/lots")
      .then((res) => setLots(res.data))
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardClient title="Lotes de Entrada" subtitle="Registros de entrada com Documento de Origem Florestal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/lotes/novo"
            className="px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
          >
            Novo Lote
          </a>
        </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "1rem",
          boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
          border: "1px solid rgba(44,26,14,0.07)",
        }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: "#FFFFFF" }}>
          <thead>
            <tr style={{ backgroundColor: "#F5F1E6" }}>
              {["Número DOF", "Fornecedor", "Data de Entrada", "Itens", "Volume Total (m³)"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#8B7355" }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "#A89888" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : lots.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "#A89888" }}
                >
                  Nenhum lote cadastrado.
                </td>
              </tr>
            ) : (
              lots.map((lot, idx) => (
                <tr
                  key={lot.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FDFCF9",
                    borderTop: "1px solid rgba(44,26,14,0.06)",
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#2C1A0E" }}>
                    {lot.dofNumber}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#5C4A35" }}>
                    {lot.supplier?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#5C4A35" }}>
                    {new Date(lot.entryDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#5C4A35" }}>
                    {lot.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#5C4A35" }}>
                    {totalVolume(lot.items ?? [])} m³
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </DashboardClient>
  );
}
