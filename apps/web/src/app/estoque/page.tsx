"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface ProductItem {
  productId: number;
  product: {
    id: number;
    wood_type: string;
    common_name: string | null;
    scientific_name: string | null;
    height_cm: number;
    width_cm: number;
    length_m: number;
    unit_volume_m3: number;
    active: boolean;
  };
  quantity: number;
  volume_m3: number;
}

interface StockData {
  totalQuantity: number;
  totalVolume_m3: number;
  productCount: number;
  speciesCount: number;
  products: ProductItem[];
  species: {
    common_name: string | null;
    scientific_name: string | null;
    quantity: number;
    volume_m3: number;
  }[];
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "1rem",
  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  border: "1px solid rgba(44,26,14,0.07)",
};

export default function EstoquePage() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/stock")
      .then((res) => setStockData(res.data))
      .catch(() => setStockData(null))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    stockData?.products.filter(
      (p) =>
        filter === "" ||
        (p.product.wood_type ?? "").toLowerCase().includes(filter.toLowerCase()) ||
        (p.product.common_name ?? "").toLowerCase().includes(filter.toLowerCase())
    ) ?? [];

  const cards = [
    {
      label: "Volume Total",
      value: stockData ? `${Number(stockData.totalVolume_m3).toFixed(4)} m³` : "—",
      color: "#2D6A4F",
    },
    {
      label: "Quantidade Total",
      value: stockData ? `${stockData.totalQuantity} unid.` : "—",
      color: "#8B5E3C",
    },
    {
      label: "Espécies",
      value: stockData ? String(stockData.speciesCount) : "—",
      color: "#2C1A0E",
    },
  ];

  return (
    <DashboardClient title="Estoque" subtitle="Visão geral do estoque por produto">
      <div className="space-y-6">
        {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="p-5 flex flex-col gap-2" style={cardStyle}>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: card.color }}
            >
              {card.label}
            </p>
            {loading ? (
              <div
                className="w-24 h-7 rounded animate-pulse"
                style={{ backgroundColor: "#E2D9CE" }}
              />
            ) : (
              <p
                className="text-2xl font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                {card.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tabela de produtos */}
      <div style={cardStyle}>
        <div className="px-4 pt-4 pb-3">
          <input
            type="text"
            placeholder="Filtrar por espécie..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border"
            style={{
              borderColor: "rgba(44,26,14,0.15)",
              backgroundColor: "#FFFFFF",
              color: "#2C1A0E",
              outline: "none",
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: "#E2D9CE", borderTopColor: "#2D6A4F" }}
            />
          </div>
        ) : stockData === null ? (
          <div className="text-center py-12" style={{ color: "#DC2626" }}>
            <p className="text-sm">Não foi possível carregar os dados. Tente novamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                  {["Espécie", "Nome Comum", "Dimensões", "Quantidade", "Volume (m³)"].map(
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "#A89888" }}
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, i) => (
                    <tr
                      key={item.productId}
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid rgba(44,26,14,0.05)"
                            : "none",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-sm font-medium"
                        style={{ color: "#2C1A0E" }}
                      >
                        {item.product.wood_type}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                        {item.product.common_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                        {item.product.height_cm}cm × {item.product.width_cm}cm ×{" "}
                        {item.product.length_m}m
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
                        {item.quantity}
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-medium"
                        style={{ color: "#8B5E3C" }}
                      >
                        {Number(item.volume_m3).toFixed(4)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </DashboardClient>
  );
}
