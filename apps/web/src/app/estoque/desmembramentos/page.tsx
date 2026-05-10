"use client";

import { useEffect, useState } from "react";
import DashboardClient from "@/components/ui/DashboardClient";
import api from "@/services/api";

interface Product {
  id: number;
  wood_type: string;
  common_name: string;
  unit_volume_m3: number;
}

interface DismembermentItem {
  id: number;
  dismembermentId: number;
  destinationProductId: number;
  destinationProduct: Product;
  quantity: number;
  volume_m3: number;
}

interface Dismemberment {
  id: number;
  originProductId: number;
  originProduct: Product;
  originQuantity: number;
  originVolume_m3: number;
  date: string;
  items: DismembermentItem[];
}

interface DestItem {
  destinationProductId: string;
  quantity: number;
}

export default function DesmembamentosPage() {
  const [dismemberments, setDismemberments] = useState<Dismemberment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [originProductId, setOriginProductId] = useState("");
  const [originQuantity, setOriginQuantity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [destItems, setDestItems] = useState<DestItem[]>([
    { destinationProductId: "", quantity: 1 },
  ]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadData() {
    Promise.all([
      api.get("/api/dismemberments"),
      api.get("/api/products"),
    ])
      .then(([dismRes, prodRes]) => {
        setDismemberments(dismRes.data);
        setProducts(prodRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function resumeItems(items: DismembermentItem[]): string {
    return items
      .map(
        (i) =>
          `${i.destinationProduct?.common_name ?? i.destinationProductId} (×${i.quantity})`,
      )
      .join(", ");
  }

  async function handleEstorno(id: number) {
    if (!confirm("Estornar este desmembramento? O estoque será revertido."))
      return;
    try {
      await api.delete(`/api/dismemberments/${id}`);
      loadData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e?.response?.data?.message ?? "Não foi possível estornar.");
    }
  }

  function addDestItem() {
    setDestItems((prev) => [
      ...prev,
      { destinationProductId: "", quantity: 1 },
    ]);
  }

  function removeDestItem(index: number) {
    setDestItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDestItem(
    index: number,
    field: keyof DestItem,
    value: string | number,
  ) {
    setDestItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!originProductId) {
      setFormError("Selecione o produto de origem.");
      return;
    }
    if (originQuantity <= 0) {
      setFormError("Quantidade de origem deve ser > 0.");
      return;
    }
    if (destItems.length === 0) {
      setFormError("Adicione ao menos 1 produto destino.");
      return;
    }
    if (destItems.some((i) => !i.destinationProductId || i.quantity <= 0)) {
      setFormError("Todos os destinos precisam de produto e quantidade > 0.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/dismemberments", {
        originProductId: Number(originProductId),
        originQuantity,
        date,
        items: destItems.map((i) => ({
          destinationProductId: Number(i.destinationProductId),
          quantity: i.quantity,
        })),
      });
      setShowForm(false);
      setOriginProductId("");
      setOriginQuantity(1);
      setDate(new Date().toISOString().slice(0, 10));
      setDestItems([{ destinationProductId: "", quantity: 1 }]);
      loadData();
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = e?.response?.status;
      if (status === 404) {
        setFormError("Produto de origem ou destino não encontrado.");
      } else {
        setFormError(
          e?.response?.data?.message ?? "Erro ao registrar desmembramento.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "1rem",
    boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
    border: "1px solid rgba(44,26,14,0.07)",
  };

  return (
    <DashboardClient
      title="Desmembramentos"
      subtitle="Transformação de produtos em estoque"
    >
      <div className="space-y-4">
        {/* Botão */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
          >
            {showForm ? "Cancelar" : "Novo Desmembramento"}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="p-6" style={cardStyle}>
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "#2C1A0E" }}
            >
              Novo Desmembramento
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Linha 1: produto origem, quantidade, data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#5C3D2E" }}
                  >
                    Produto de origem *
                  </label>
                  <select
                    value={originProductId}
                    onChange={(e) => setOriginProductId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(44,26,14,0.2)", color: "#2C1A0E" }}
                  >
                    <option value="">Selecione...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.common_name} — {p.wood_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#5C3D2E" }}
                  >
                    Quantidade de origem *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={originQuantity}
                    onChange={(e) =>
                      setOriginQuantity(Number(e.target.value))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(44,26,14,0.2)", color: "#2C1A0E" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#5C3D2E" }}
                  >
                    Data *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(44,26,14,0.2)", color: "#2C1A0E" }}
                  />
                </div>
              </div>

              {/* Itens destino */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#5C3D2E" }}
                  >
                    Produtos destino *
                  </span>
                  <button
                    type="button"
                    onClick={addDestItem}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ backgroundColor: "rgba(45,106,79,0.1)", color: "#2D6A4F" }}
                  >
                    + Adicionar destino
                  </button>
                </div>

                <div className="space-y-2">
                  {destItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <select
                        value={item.destinationProductId}
                        onChange={(e) =>
                          updateDestItem(
                            index,
                            "destinationProductId",
                            e.target.value,
                          )
                        }
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        style={{ borderColor: "rgba(44,26,14,0.2)", color: "#2C1A0E" }}
                      >
                        <option value="">Selecione...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.common_name} — {p.wood_type}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateDestItem(index, "quantity", Number(e.target.value))
                        }
                        placeholder="Qtde"
                        className="w-24 border rounded-lg px-3 py-2 text-sm"
                        style={{ borderColor: "rgba(44,26,14,0.2)", color: "#2C1A0E" }}
                      />

                      {destItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDestItem(index)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ color: "#9b2c2c" }}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-sm" style={{ color: "#9b2c2c" }}>
                  {formError}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold rounded-xl disabled:opacity-50"
                  style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
                >
                  {submitting ? "Registrando..." : "Registrar Desmembramento"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela */}
        <div style={cardStyle}>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: "#5C3D2E" }}>
              Carregando...
            </div>
          ) : dismemberments.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "#5C3D2E" }}>
              Nenhum desmembramento registrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.08)" }}>
                    {["Data", "Produto Origem", "Qtde Origem", "Produtos Gerados", "Ações"].map(
                      (col) => (
                        <th
                          key={col}
                          className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#5C3D2E" }}
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dismemberments.map((d) => (
                    <tr
                      key={d.id}
                      style={{ borderBottom: "1px solid rgba(44,26,14,0.05)" }}
                    >
                      <td className="px-5 py-3" style={{ color: "#2C1A0E" }}>
                        {new Date(d.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-3" style={{ color: "#2C1A0E" }}>
                        {d.originProduct?.common_name ?? d.originProductId}
                        <span
                          className="ml-1 text-xs"
                          style={{ color: "#8B6B52" }}
                        >
                          ({d.originProduct?.wood_type})
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ color: "#2C1A0E" }}>
                        {d.originQuantity}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "#2C1A0E", maxWidth: "260px" }}
                      >
                        {resumeItems(d.items)}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleEstorno(d.id)}
                          className="text-xs px-3 py-1 rounded-lg font-medium"
                          style={{
                            backgroundColor: "rgba(155,44,44,0.08)",
                            color: "#9b2c2c",
                          }}
                        >
                          Estornar
                        </button>
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
