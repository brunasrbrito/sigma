"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface Movement {
  id: number;
  type: "saida" | "ajuste";
  product: {
    id: number;
    wood_type: string;
    common_name: string | null;
  };
  productId: number;
  quantity: number;
  volume_m3: number;
  date: string;
  observation: string | null;
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "1rem",
  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  border: "1px solid rgba(44,26,14,0.07)",
};

function badgeMovimento(type: string): React.CSSProperties {
  return type === "saida"
    ? { backgroundColor: "#FEE2E2", color: "#991B1B" }
    : { backgroundColor: "#EEF4FB", color: "#1D4E89" };
}

function labelMovimento(type: string): string {
  return type === "saida" ? "Saída" : "Ajuste";
}

export default function MovimentacoesPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/movements")
      .then((res) => setMovements(res.data))
      .catch(() => setMovements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardClient title="Movimentações" subtitle="Saídas e ajustes de estoque">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/estoque/nova-movimentacao"
            className="px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
          >
            Nova Movimentação
          </a>
        </div>

      <div style={cardStyle}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: "#E2D9CE", borderTopColor: "#2D6A4F" }}
            />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#A89888" }}>
            <p className="text-sm">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                  {["Data", "Tipo", "Produto", "Qtde", "Volume (m³)", "Observação"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left"
                        style={{ color: "#8B7355" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {movements.map((mov, i) => (
                  <tr
                    key={mov.id}
                    style={{
                      borderBottom:
                        i < movements.length - 1
                          ? "1px solid rgba(44,26,14,0.05)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {new Date(mov.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={badgeMovimento(mov.type)}
                      >
                        {labelMovimento(mov.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#2C1A0E" }}>
                      <span className="font-medium">{mov.product.wood_type}</span>
                      {mov.product.common_name && (
                        <span
                          className="block text-xs"
                          style={{ color: "#8B7355" }}
                        >
                          {mov.product.common_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {mov.quantity}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{ color: "#8B5E3C" }}
                    >
                      {Number(mov.volume_m3).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                      {mov.observation ?? "—"}
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
