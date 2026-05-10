"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface Product {
  id: number;
  wood_type: string;
  common_name: string | null;
  height_cm: number;
  width_cm: number;
  length_m: number;
  active: boolean;
}

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "1rem",
  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  border: "1px solid rgba(44,26,14,0.07)",
};

const inputClass = "w-full h-11 px-4 rounded-xl text-sm outline-none transition-all";
const inputStyle = {
  border: "1px solid #E2D9CE",
  backgroundColor: "#FAFAF8",
  color: "#2C1A0E",
};

const labelStyle = { color: "#3D2B1F" };

export default function NovaMovimentacaoPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [type, setType] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [observation, setObservation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Selecione o tipo de movimentação.");
      return;
    }
    if (!productId) {
      setError("Selecione um produto.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Informe uma quantidade maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/movements", {
        type,
        productId: Number(productId),
        quantity: Number(quantity),
        date: date || undefined,
        observation: observation || undefined,
      });
      router.push("/estoque/movimentacoes");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao registrar movimentação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardClient title="Nova Movimentação" subtitle="Registrar saída ou ajuste de estoque">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/estoque/movimentacoes"
            className="text-sm font-medium"
            style={{ color: "#8B7355" }}
          >
            ← Voltar
          </a>
        </div>

      <div className="max-w-lg" style={cardStyle}>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Tipo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          {/* Produto */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Produto *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              {products
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.wood_type}
                    {p.common_name ? ` — ${p.common_name}` : ""} (
                    {p.height_cm}cm × {p.width_cm}cm × {p.length_m}m)
                  </option>
                ))}
            </select>
          </div>

          {/* Quantidade */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Quantidade *
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Observação
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={3}
              placeholder="Ex: Venda para cliente X"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <a
              href="/estoque/movimentacoes"
              className="flex-1 h-11 flex items-center justify-center rounded-xl text-sm font-semibold"
              style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white"
              style={{
                backgroundColor: submitting ? "#6B9E7A" : "#2D6A4F",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(45,106,79,0.35)",
              }}
            >
              {submitting ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </DashboardClient>
  );
}
