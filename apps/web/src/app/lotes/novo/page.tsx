"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  wood_type: string;
  common_name?: string | null;
  unit_volume_m3: number;
  active: boolean;
}

interface LotItemForm {
  productId: string;
  quantity: number;
  unit_volume_m3: number;
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

export default function NovoLotePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [dofNumber, setDofNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<LotItemForm[]>([{ productId: "", quantity: 1, unit_volume_m3: 0 }]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/suppliers"),
      api.get("/api/products"),
    ]).then(([suppRes, prodRes]) => {
      setSuppliers(suppRes.data);
      setProducts(prodRes.data);
    });
  }, []);

  function handleProductChange(index: number, productId: string) {
    const product = products.find((p) => String(p.id) === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, productId, unit_volume_m3: product?.unit_volume_m3 ?? 0 }
          : item
      )
    );
  }

  function handleQuantityChange(index: number, quantity: number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantity: 1, unit_volume_m3: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!dofNumber.trim()) { setError("Número DOF é obrigatório."); return; }
    if (!supplierId) { setError("Selecione um fornecedor."); return; }
    if (!entryDate) { setError("Data de entrada é obrigatória."); return; }
    if (items.length === 0) { setError("Adicione ao menos 1 item."); return; }
    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setError("Todos os itens precisam de produto e quantidade > 0.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/lots", {
        dofNumber,
        supplierId: Number(supplierId),
        entryDate,
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: i.quantity,
        })),
      });
      router.push("/lotes");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError("Número de DOF já cadastrado.");
      } else if (status === 404) {
        setError("Fornecedor ou produto não encontrado.");
      } else {
        setError(err?.response?.data?.message ?? "Erro ao registrar lote.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardClient title="Novo Lote" subtitle="Registrar entrada de madeira com DOF">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <a href="/lotes" className="text-sm font-medium" style={{ color: "#8B7355" }}>
            ← Voltar
          </a>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos fixos */}
        <div className="max-w-lg p-6 space-y-5" style={cardStyle}>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Número DOF *
            </label>
            <input
              type="text"
              value={dofNumber}
              onChange={(e) => setDofNumber(e.target.value)}
              placeholder="Ex: DOF-2026-00123"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Fornecedor *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold block" style={labelStyle}>
              Data de Entrada *
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Itens */}
        <div className="p-6 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "#2C1A0E" }}>
              Itens do Lote
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "#EEF4FB", color: "#1D4E89" }}
            >
              + Adicionar item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#F5F1E6" }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B7355" }}>
                    Produto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B7355" }}>
                    Quantidade
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B7355" }}>
                    Volume
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderTop: "1px solid rgba(44,26,14,0.06)" }}
                  >
                    <td className="px-3 py-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="h-9 px-3 rounded-xl text-sm outline-none w-full"
                        style={{ ...inputStyle, minWidth: "200px" }}
                      >
                        <option value="">Selecione...</option>
                        {products
                          .filter((p) => p.active)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.wood_type}
                              {p.common_name ? ` — ${p.common_name}` : ""}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="h-9 px-3 rounded-xl text-sm outline-none w-24"
                        style={inputStyle}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm" style={{ color: "#7A6555" }}>
                      {(item.unit_volume_m3 * item.quantity).toFixed(4)} m³
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg"
                        style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#DC2626" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 max-w-lg">
          <a
            href="/lotes"
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
            {submitting ? "Registrando..." : "Registrar Lote"}
          </button>
        </div>
      </form>
      </div>
    </DashboardClient>
  );
}
