"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));

      await new Promise((r) => setTimeout(r, 150));

      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);

      if (err.response?.status === 401) {
        setError("Email ou senha inválidos");
      } else {
        setError("Erro ao conectar com o servidor");
      }

      return;
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex bg-[#F5F1E6]">
      {/* Painel esquerdo decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: "#2C1A0E" }}
      >
        {/* Textura de fundo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.03) 20px,
              rgba(255,255,255,0.03) 40px
            )`,
          }}
        />

        {/* Círculo decorativo */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #8B5E3C 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #4A7C59 0%, transparent 70%)",
          }}
        />

        {/* Logo no painel esquerdo */}
        <div className="relative z-10">
          <Image
            src="/images/sigma.png"
            alt="Sigma"
            width={260}
            height={80}
            priority
          />
        </div>

        {/* Texto central */}
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
            Gestão inteligente
            <br />
            <span style={{ color: "#A0C878" }}>para sua madeireira</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#B8A898" }}>
            Controle estoque, vendas e operações em um único sistema projetado
            para o setor madeireiro.
          </p>
        </div>

        {/* Rodapé do painel */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#6B5040" }}>
            © 2026 Sigma · Sistema de Gestão de Madeireiras
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo visível só no mobile */}
          <div className="flex justify-center lg:hidden">
            <Image
              src="/images/sigma.png"
              alt="Sigma"
              width={280}
              height={80}
              priority
            />
          </div>

          {/* Cabeçalho do formulário */}
          <div className="space-y-1 text-center lg:text-left">
            <h1
              className="text-2xl font-bold"
              style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
            >
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: "#7A6555" }}>
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Formulário */}
          <div
            className="rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 4px 6px -1px rgba(44,26,14,0.06), 0 20px 40px -8px rgba(44,26,14,0.10)",
              border: "1px solid rgba(44,26,14,0.06)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold"
                  style={{ color: "#3D2B1F" }}
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="email"
                  className="h-11 rounded-xl text-sm transition-all"
                  style={{
                    borderColor: error ? "#DC2626" : "#E2D9CE",
                    backgroundColor: "#FAFAF8",
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: "#3D2B1F" }}
                  >
                    Senha
                  </Label>
                  <Link
                    href="/forgotPass"
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: "#4A7C59" }}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  className="h-11 rounded-xl text-sm transition-all"
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
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
