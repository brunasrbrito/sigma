"use client";

import { useState, useEffect } from "react";
import DashboardClient from "@/components/ui/DashboardClient";
import api from "@/services/api";

interface Profile {
  id: number;
  name: string;
}

export default function PerfisPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  async function loadProfiles() {
    try {
      const res = await api.get("/api/profiles");
      setProfiles(res.data);
    } catch {
      setError("Erro ao carregar perfis.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(profile: Profile) {
    setEditing(profile);
    setName(profile.name);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setName("");
    setError("");
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editing) {
        await api.put(`/api/profiles/${editing.id}`, { name });
      } else {
        await api.post("/api/profiles", { name });
      }
      await loadProfiles();
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Perfil já existe.");
      } else {
        setError("Erro ao salvar perfil.");
      }
    } finally {
      setSaving(false);
    }
  }

  function openDelete(profile: Profile) {
    setProfileToDelete(profile);
    setDeleteModal(true);
  }

  async function confirmDelete() {
    if (!profileToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/profiles/${profileToDelete.id}`);
      await loadProfiles();
      setDeleteModal(false);
      setProfileToDelete(null);
    } catch {
      alert("Erro ao remover perfil.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardClient title="Perfis" subtitle="Gerencie os perfis de acesso">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B7355" }}
          >
            Perfis cadastrados
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
            Novo Perfil
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
          ) : profiles.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "#2C1A0E" }}>
                Nenhum perfil cadastrado
              </p>
              <p className="text-xs" style={{ color: "#A89888" }}>
                Clique em "Novo Perfil" para começar
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                  <th
                    className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#8B7355" }}
                  >
                    Nome
                  </th>
                  <th
                    className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#8B7355" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, i) => (
                  <tr
                    key={profile.id}
                    style={{
                      borderBottom:
                        i < profiles.length - 1
                          ? "1px solid rgba(44,26,14,0.05)"
                          : "none",
                    }}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: "#F5F1E6", color: "#2C1A0E" }}
                      >
                        {profile.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(profile)}
                          className="p-2 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                          style={{ color: "#2D6A4F" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#F0FAF4")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDelete(profile)}
                          className="p-2 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                          style={{ color: "#DC2626" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#FEF2F2")
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
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(44,26,14,0.5)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 20px 60px rgba(44,26,14,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                {editing ? "Editar Perfil" : "Novo Perfil"}
              </h2>
              <button
                onClick={closeModal}
                className="cursor-pointer"
                style={{ color: "#A89888" }}
              >
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

            <div className="space-y-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "#3D2B1F" }}
              >
                Nome do perfil
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="ex: admin, operador..."
                className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: `1px solid ${error ? "#DC2626" : "#E2D9CE"}`,
                  backgroundColor: "#FAFAF8",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              {error && (
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  <span>⚠</span> {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
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
                Remover Perfil
              </h2>
              <p className="text-sm" style={{ color: "#7A6555" }}>
                Tem certeza que deseja remover o perfil{" "}
                <strong style={{ color: "#2C1A0E" }}>
                  "{profileToDelete?.name}"
                </strong>
                ? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setProfileToDelete(null);
                }}
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
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
