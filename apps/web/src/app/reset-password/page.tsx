"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!token) {
      setError("Token inválido.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Link inválido ou expirado. Solicite um novo.");
      } else {
        setError("Erro ao conectar com o servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F1E6]">
      {/* Painel esquerdo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: "#2C1A0E" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg, transparent, transparent 20px,
              rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px
            )`,
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #8B5E3C 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <Image
            src="/images/sigma.png"
            alt="Sigma"
            width={260}
            height={80}
            priority
          />
        </div>
        <div className="relative z-10 space-y-6">
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: "#8B5E3C" }}
          />
          <h2
            className="text-4xl font-bold leading-tight"
            style={{
              color: "#F5F1E6",
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.02em",
            }}
          >
            Crie uma nova
            <br />
            <span style={{ color: "#A0C878" }}>senha segura</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#B8A898" }}>
            Escolha uma senha forte para proteger sua conta no sistema.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#6B5040" }}>
            © 2026 Sigma · Sistema de Gestão de Madeireiras
          </p>
        </div>
      </div>

      {/* Painel direito */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <Image
              src="/images/sigma.png"
              alt="Sigma"
              width={280}
              height={80}
              priority
            />
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h1
              className="text-2xl font-bold"
              style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
            >
              Redefinir senha
            </h1>
            <p className="text-sm" style={{ color: "#7A6555" }}>
              Digite sua nova senha abaixo.
            </p>
          </div>

          <div
            className="rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 4px 6px -1px rgba(44,26,14,0.06), 0 20px 40px -8px rgba(44,26,14,0.10)",
              border: "1px solid rgba(44,26,14,0.06)",
            }}
          >
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: "#F0FAF4" }}
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "#2C1A0E" }}
                  >
                    Senha redefinida com sucesso!
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#7A6555" }}
                  >
                    Você será redirecionado para o login em instantes...
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-block w-full h-11 rounded-xl font-semibold text-sm text-white text-center leading-[44px] transition-all duration-200"
                  style={{
                    backgroundColor: "#2D6A4F",
                    boxShadow: "0 4px 14px rgba(45,106,79,0.35)",
                  }}
                >
                  Ir para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Nova senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="h-11 rounded-xl text-sm"
                    style={{
                      borderColor: error ? "#DC2626" : "#E2D9CE",
                      backgroundColor: "#FAFAF8",
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm"
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Confirmar senha
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError("");
                    }}
                    className="h-11 rounded-xl text-sm"
                    style={{
                      borderColor: error ? "#DC2626" : "#E2D9CE",
                      backgroundColor: "#FAFAF8",
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: "#FEF2F2",
                      color: "#DC2626",
                      border: "1px solid #FECACA",
                    }}
                  >
                    <span>⚠</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isLoading ? "#6B9E7A" : "#2D6A4F",
                    color: "#FFFFFF",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 14px rgba(45,106,79,0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
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
                      Salvando...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/"
                    className="text-xs font-medium hover:underline"
                    style={{ color: "#4A7C59" }}
                  >
                    ← Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
