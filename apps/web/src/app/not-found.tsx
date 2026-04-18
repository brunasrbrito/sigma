import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
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
            Página não
            <br />
            <span style={{ color: "#A0C878" }}>encontrada</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#B8A898" }}>
            O endereço que você tentou acessar não existe ou foi removido do
            sistema.
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
        <div className="w-full max-w-md space-y-8 text-center lg:text-left">
          <div className="flex justify-center lg:hidden">
            <Image
              src="/images/sigma.png"
              alt="Sigma"
              width={280}
              height={80}
              priority
            />
          </div>

          <div>
            <p
              className="text-8xl font-bold"
              style={{
                color: "#2C1A0E",
                fontFamily: "Georgia, serif",
                opacity: 0.15,
              }}
            >
              404
            </p>
            <h1
              className="text-2xl font-bold -mt-4"
              style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
            >
              Página não encontrada
            </h1>
            <p className="text-sm mt-2" style={{ color: "#7A6555" }}>
              O endereço que você tentou acessar não existe ou foi removido.
            </p>
          </div>

          <div
            className="rounded-2xl p-8 space-y-4"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 4px 6px -1px rgba(44,26,14,0.06), 0 20px 40px -8px rgba(44,26,14,0.10)",
              border: "1px solid rgba(44,26,14,0.06)",
            }}
          >
            <p className="text-sm" style={{ color: "#7A6555" }}>
              O que você pode fazer:
            </p>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200"
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Ir para o Dashboard
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  backgroundColor: "transparent",
                  color: "#2D6A4F",
                  border: "1px solid #2D6A4F",
                }}
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
