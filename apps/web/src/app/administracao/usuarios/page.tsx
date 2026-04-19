"use client";

import { useState, useEffect } from "react";
import DashboardClient from "@/components/ui/DashboardClient";
import api from "@/services/api";

interface Profile {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  profile: Profile | null;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal criar/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profileId: "",
    active: true,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal reset senha
  const [resetModal, setResetModal] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  // Modal delete
  const [deleteModal, setDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      const [usersRes, profilesRes] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/profiles"),
      ]);
      setUsers(usersRes.data);
      setProfiles(profilesRes.data);
    } catch {
      console.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", profileId: "", active: true });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      profileId: user.profile?.id?.toString() || "",
      active: user.active,
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
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Nome e email são obrigatórios.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setFormError("Senha é obrigatória para novo usuário.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editing) {
        await api.put(`/api/users/${editing.id}`, {
          name: form.name,
          email: form.email,
          profileId: form.profileId ? Number(form.profileId) : null,
          active: form.active,
        });
      } else {
        await api.post("/api/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          profileId: form.profileId ? Number(form.profileId) : null,
          active: form.active,
        });
      }
      await loadData();
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFormError("Email já cadastrado.");
      } else {
        setFormError("Erro ao salvar usuário.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword.trim() || newPassword.length < 6) {
      setResetError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setResetting(true);
    setResetError("");
    try {
      await api.put(`/api/users/${resetUser?.id}/reset-password`, {
        newPassword,
      });
      setResetModal(false);
      setResetUser(null);
      setNewPassword("");
    } catch {
      setResetError("Erro ao redefinir senha.");
    } finally {
      setResetting(false);
    }
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/users/${userToDelete.id}`);
      await loadData();
      setDeleteModal(false);
      setUserToDelete(null);
    } catch {
      alert("Erro ao remover usuário.");
    } finally {
      setDeleting(false);
    }
  }

  const inputStyle = (error?: boolean) => ({
    border: `1px solid ${error ? "#DC2626" : "#E2D9CE"}`,
    backgroundColor: "#FAFAF8",
  });

  return (
    <DashboardClient
      title="Usuários"
      subtitle="Gerencie os usuários do sistema"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#8B7355" }}
          >
            Usuários cadastrados
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
            Novo Usuário
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
          ) : users.length === 0 ? (
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
                Nenhum usuário cadastrado
              </p>
              <p className="text-xs" style={{ color: "#A89888" }}>
                Clique em "Novo Usuário" para começar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
                    {["Nome", "Email", "Perfil", "Status", "Ações"].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${h === "Ações" ? "text-right" : "text-left"}`}
                        style={{ color: "#8B7355" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          i < users.length - 1
                            ? "1px solid rgba(44,26,14,0.05)"
                            : "none",
                      }}
                    >
                      <td
                        className="px-6 py-4 text-sm font-medium"
                        style={{ color: "#2C1A0E" }}
                      >
                        {user.name}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: "#7A6555" }}
                      >
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        {user.profile ? (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: "#F5F1E6",
                              color: "#2C1A0E",
                            }}
                          >
                            {user.profile.name}
                          </span>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "#A89888" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={
                            user.active
                              ? { backgroundColor: "#F0FAF4", color: "#2D6A4F" }
                              : { backgroundColor: "#FEF2F2", color: "#DC2626" }
                          }
                        >
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(user)}
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
                              setResetUser(user);
                              setNewPassword("");
                              setResetError("");
                              setResetModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            style={{ color: "#1D4E89" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#EEF4FB")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            Senha
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
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
                {editing ? "Editar Usuário" : "Novo Usuário"}
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
                  Nome
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={inputStyle()}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#3D2B1F" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={inputStyle()}
                />
              </div>

              {!editing && (
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                    style={inputStyle()}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#3D2B1F" }}
                >
                  Perfil
                </label>
                <select
                  value={form.profileId}
                  onChange={(e) =>
                    setForm({ ...form, profileId: e.target.value })
                  }
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={inputStyle()}
                >
                  <option value="">Sem perfil</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

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

      {/* Modal Reset Senha */}
      {resetModal && (
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
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
              >
                Redefinir Senha
              </h2>
              <button
                onClick={() => {
                  setResetModal(false);
                  setResetUser(null);
                }}
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
            <p className="text-sm" style={{ color: "#7A6555" }}>
              Definindo nova senha para{" "}
              <strong style={{ color: "#2C1A0E" }}>{resetUser?.name}</strong>.
            </p>
            <div className="space-y-1.5">
              <label
                className="text-sm font-semibold"
                style={{ color: "#3D2B1F" }}
              >
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setResetError("");
                }}
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{
                  border: `1px solid ${resetError ? "#DC2626" : "#E2D9CE"}`,
                  backgroundColor: "#FAFAF8",
                }}
              />
              {resetError && (
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                  }}
                >
                  <span>⚠</span> {resetError}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResetModal(false);
                  setResetUser(null);
                }}
                className="flex-1 h-11 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ border: "1px solid #E2D9CE", color: "#7A6555" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white cursor-pointer"
                style={{ backgroundColor: resetting ? "#5B8FBF" : "#1D4E89" }}
              >
                {resetting ? "Salvando..." : "Redefinir"}
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
                Remover Usuário
              </h2>
              <p className="text-sm" style={{ color: "#7A6555" }}>
                Tem certeza que deseja remover{" "}
                <strong style={{ color: "#2C1A0E" }}>
                  {userToDelete?.name}
                </strong>
                ? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setUserToDelete(null);
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
