"use client";

import { useState, useEffect } from "react";
import DashboardClient from "@/components/ui/DashboardClient";
import api from "@/services/api";

interface Product {
  id: number;
  wood_type: string;
  scientific_name: string | null;
  common_name: string | null;
  height_cm: number;
  width_cm: number;
  length_m: number;
  unit_volume_m3: number;
  active: boolean;
}

const emptyForm = {
  wood_type: "",
  scientific_name: "",
  common_name: "",
  height_cm: "",
  width_cm: "",
  length_m: "",
  active: true,
};

export default function CadastroMadeirasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts() {
    try {
      const res = await api.get("/api/products");
      console.log("resposta:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // calcula volume em tempo real
  const previewVolume = () => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.width_cm);
    const l = parseFloat(form.length_m);
    if (!h || !w || !l) return null;
    return ((h * w * l) / 10000).toFixed(6);
  };

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      wood_type: product.wood_type,
      scientific_name: product.scientific_name || "",
      common_name: product.common_name || "",
      height_cm: String(product.height_cm),
      width_cm: String(product.width_cm),
      length_m: String(product.length_m),
      active: product.active,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setFormError("");
  }

  async function handleSave() {
    if (!form.wood_type.trim()) {
      setFormError("Tipo de madeira é obrigatório.");
      return;
    }
    if (!form.height_cm || !form.width_cm || !form.length_m) {
      setFormError("Dimensões são obrigatórias.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        wood_type: form.wood_type,
        scientific_name: form.scientific_name || null,
        common_name: form.common_name || null,
        height_cm: parseFloat(form.height_cm),
        width_cm: parseFloat(form.width_cm),
        length_m: parseFloat(form.length_m),
        active: form.active,
      };

      if (editing) {
        await api.put(`/api/products/${editing.id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }

      await loadProducts();
      closeModal();
    } catch {
      setFormError("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/products/${productToDelete.id}`);
      await loadProducts();
      setDeleteModal(false);
      setProductToDelete(null);
    } catch {
      alert("Erro ao remover produto.");
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full h-11 px-4 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    border: "1px solid #E2D9CE",
    backgroundColor: "#FAFAF8",
  };

  return (
    <DashboardClient
      title="Cadastro de Madeiras"
      subtitle="Gerencie os tipos de madeira do sistema"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B7355" }}
          >
            Madeiras cadastradas
          </h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
            style={{
              backgroundColor: "#2D6A4F",
              boxShadow: "0 4px 14px rgba(45,106,79,0.35)",
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova Madeira
          </button>
        </div>

        {/* Tabela */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(44,26,14,0.07)",
            boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <svg
                className="animate-spin w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: "#2D6A4F" }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "#2C1A0E" }}>
                Nenhuma madeira cadastrada
              </p>
              <p className="text-xs" style={{ color: "#A89888" }}>
                Clique em "Nova Madeira" para começar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                    {[
                      "Tipo",
                      "Nome Científico",
                      "Nome Comum",
                      "Altura (cm)",
                      "Largura (cm)",
                      "Comprimento (m)",
                      "Volume (m³)",
                      "Status",
                      "Ações",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${h === "Ações" ? "text-right" : "text-left"}`}
                        style={{ color: "#8B7355" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom:
                          i < products.length - 1
                            ? "1px solid rgba(44,26,14,0.05)"
                            : "none",
                      }}
                    >
                      <td
                        className="px-4 py-4 text-sm font-medium"
                        style={{ color: "#2C1A0E" }}
                      >
                        {product.wood_type}
                      </td>
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {product.scientific_name || "—"}
                      </td>
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {product.common_name || "—"}
                      </td>
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {Number(product.height_cm).toFixed(2)}
                      </td>
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {Number(product.width_cm).toFixed(2)}
                      </td>
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {Number(product.length_m).toFixed(3)}
                      </td>
                      <td
                        className="px-4 py-4 text-sm font-medium"
                        style={{ color: "#8B5E3C" }}
                      >
                        {Number(product.unit_volume_m3).toFixed(6)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={
                            product.active
                              ? { backgroundColor: "#F0FAF4", color: "#2D6A4F" }
                              : { backgroundColor: "#FEF2F2", color: "#DC2626" }
                          }
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            style={{ color: "#2D6A4F" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F0FAF4")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            style={{ color: "#DC2626" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#FEF2F2")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(44,26,14,0.5)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-8 space-y-6 overflow-y-auto"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 60px rgba(44,26,14,0.2)",
              maxHeight: "90vh",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                {editing ? "Editar Madeira" : "Nova Madeira"}
              </h2>
              <button onClick={closeModal} style={{ color: "#A89888" }}>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#3D2B1F" }}
                >
                  Tipo de Madeira *
                </label>
                <input
                  type="text"
                  value={form.wood_type}
                  onChange={(e) =>
                    setForm({ ...form, wood_type: e.target.value })
                  }
                  placeholder="ex: Eucalipto, Pinus..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Nome Científico
                  </label>
                  <input
                    type="text"
                    value={form.scientific_name}
                    onChange={(e) =>
                      setForm({ ...form, scientific_name: e.target.value })
                    }
                    placeholder="ex: Eucalyptus sp."
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Nome Comum
                  </label>
                  <input
                    type="text"
                    value={form.common_name}
                    onChange={(e) =>
                      setForm({ ...form, common_name: e.target.value })
                    }
                    placeholder="ex: Eucalipto"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.height_cm}
                    onChange={(e) =>
                      setForm({ ...form, height_cm: e.target.value })
                    }
                    placeholder="0.00"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Largura (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.width_cm}
                    onChange={(e) =>
                      setForm({ ...form, width_cm: e.target.value })
                    }
                    placeholder="0.00"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Comprimento (m) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.length_m}
                    onChange={(e) =>
                      setForm({ ...form, length_m: e.target.value })
                    }
                    placeholder="0.000"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Preview do volume */}
              {previewVolume() && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "#F5F1E6",
                    border: "1px solid rgba(139,94,60,0.2)",
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#8B5E3C"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm" style={{ color: "#8B5E3C" }}>
                    Volume unitário calculado:{" "}
                    <strong>{previewVolume()} m³</strong>
                  </p>
                </div>
              )}

              {editing && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer"
                    style={{
                      backgroundColor: form.active ? "#2D6A4F" : "#E2D9CE",
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      style={{
                        transform: form.active
                          ? "translateX(20px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "#3D2B1F" }}
                  >
                    {form.active ? "Ativo" : "Inativo"}
                  </label>
                </div>
              )}

              {formError && (
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  <span>⚠</span> {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-11 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white cursor-pointer"
                style={{
                  backgroundColor: saving ? "#6B9E7A" : "#2D6A4F",
                  boxShadow: saving
                    ? "none"
                    : "0 4px 14px rgba(45,106,79,0.35)",
                }}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(44,26,14,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 60px rgba(44,26,14,0.2)",
            }}
          >
            <div className="text-center space-y-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "#FEF2F2" }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#DC2626"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2
                className="text-lg font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                Remover Madeira
              </h2>
              <p className="text-sm" style={{ color: "#7A6555" }}>
                Tem certeza que deseja remover{" "}
                <strong style={{ color: "#2C1A0E" }}>
                  "{productToDelete?.wood_type}"
                </strong>
                ? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 h-11 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white cursor-pointer"
                style={{ backgroundColor: deleting ? "#EF9999" : "#DC2626" }}
              >
                {deleting ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardClient>
  );
}
