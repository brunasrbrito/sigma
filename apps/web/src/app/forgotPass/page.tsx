"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPassPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Preencha o campo de e-mail.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 800);
  }

  return (
    <div className="min-h-screen flex bg-[#F5F1E6]">
      {/* Painel esquerdo decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: "#2C1A0E" }}
      >
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
            Recupere seu
            <br />
            <span style={{ color: "#A0C878" }}>acesso ao sistema</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#B8A898" }}>
            Enviaremos um link de redefinição para o e-mail cadastrado na sua
            conta.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#6B5040" }}>
            © 2026 Sigma · Sistema de Gestão de Madeireiras
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="flex justify-center lg:hidden">
            <Image
              src="/images/sigma.png"
              alt="Sigma"
              width={280}
              height={80}
              priority
            />
          </div>

          {/* Cabeçalho */}
          <div className="space-y-1 text-center lg:text-left">
            <h1
              className="text-2xl font-bold"
              style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
            >
              Esqueceu a senha?
            </h1>
            <p className="text-sm" style={{ color: "#7A6555" }}>
              Informe seu e-mail e enviaremos as instruções de recuperação.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8 space-y-6"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 4px 6px -1px rgba(44,26,14,0.06), 0 20px 40px -8px rgba(44,26,14,0.10)",
              border: "1px solid rgba(44,26,14,0.06)",
            }}
          >
            {sent ? (
              /* Estado de sucesso */
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
                    E-mail enviado!
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#7A6555" }}
                  >
                    Verifique sua caixa de entrada em{" "}
                    <span className="font-medium">{email}</span> e siga as
                    instruções para redefinir sua senha.
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
                  Voltar ao login
                </Link>
              </div>
            ) : (
              /* Formulário */
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
                      setError("");
                    }}
                    autoComplete="email"
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
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções"
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/"
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: "#4A7C59" }}
                  >
                    ← Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-xs" style={{ color: "#A89888" }}>
            Problemas para acessar?{" "}
            <a
              href="mailto:suporte@univesp-pi.com.br"
              className="font-medium transition-colors hover:underline"
              style={{ color: "#4A7C59" }}
            >
              Fale com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
