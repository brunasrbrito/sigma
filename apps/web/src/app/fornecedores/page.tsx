"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import DashboardClient from "@/components/ui/DashboardClient";

interface Supplier {
  id: number;
  name: string;
  cnpj: string;
  contact?: string;
}

function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contact, setContact] = useState("");

  function loadSuppliers() {
    setLoading(true);
    api
      .get("/api/suppliers")
      .then((res) => setSuppliers(res.data))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setCnpj("");
    setContact("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setName(supplier.name);
    setCnpj(supplier.cnpj);
    setContact(supplier.contact ?? "");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || cnpj.replace(/\D/g, "").length !== 14) {
      setError("Nome e CNPJ (14 dígitos) são obrigatórios.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name,
        cnpj: cnpj.replace(/\D/g, ""),
        contact: contact || undefined,
      };
      if (editing) {
        await api.put(`/api/suppliers/${editing.id}`, payload);
      } else {
        await api.post("/api/suppliers", payload);
      }
      setModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError("CNPJ já cadastrado para outro fornecedor.");
      } else {
        setError(err?.response?.data?.message ?? "Erro ao salvar fornecedor.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover este fornecedor?")) return;
    try {
      await api.delete(`/api/suppliers/${id}`);
      loadSuppliers();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Não foi possível remover o fornecedor.");
    }
  }

  return (
    <DashboardClient title="Fornecedores" subtitle="Gerencie os fornecedores cadastrados">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
          >
            Novo Fornecedor
          </button>
        </div>

      {/* Tabela */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(44,26,14,0.08)" }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: "#FFFFFF" }}>
          <thead>
            <tr style={{ backgroundColor: "#F5F1E6" }}>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#8B7355" }}
              >
                Nome
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#8B7355" }}
              >
                CNPJ
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#8B7355" }}
              >
                Contato
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#8B7355" }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "#8B7355" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "#8B7355" }}
                >
                  Nenhum fornecedor cadastrado.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, idx) => (
                <tr
                  key={supplier.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FDFCF9",
                    borderTop: "1px solid rgba(44,26,14,0.06)",
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "#2C1A0E" }}>
                    {supplier.name}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "#5C4A35" }}
                  >
                    {formatCnpj(supplier.cnpj)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#5C4A35" }}>
                    {supplier.contact ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(supplier)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg"
                        style={{ backgroundColor: "#EEF4FB", color: "#1D4E89" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg"
                        style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(44,26,14,0.4)" }}
        >
          <div
            className="w-full max-w-md p-6 space-y-4"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "1rem",
              boxShadow: "0 8px 32px rgba(44,26,14,0.15)",
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
            >
              {editing ? "Editar Fornecedor" : "Novo Fornecedor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "#8B7355" }}
                >
                  Nome *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border"
                  style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "#8B7355" }}
                >
                  CNPJ * (14 dígitos)
                </label>
                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00000000000000"
                  maxLength={18}
                  className="w-full px-3 py-2 text-sm rounded-xl border font-mono"
                  style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: "#8B7355" }}
                >
                  Contato (opcional)
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border"
                  style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
                />
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#DC2626" }}>
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl"
                  style={{ backgroundColor: "#F5F1E6", color: "#8B7355" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold rounded-xl"
                  style={{
                    backgroundColor: "#2D6A4F",
                    color: "#FFFFFF",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardClient>
  );
}
