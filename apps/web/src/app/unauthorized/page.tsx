"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5F1E6" }}
    >
      <div className="text-center space-y-4">
        <h1
          className="text-5xl font-bold"
          style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
        >
          401
        </h1>

        <p className="text-lg" style={{ color: "#7A6555" }}>
          Você não tem permissão para acessar esta página
        </p>

        <div className="text-center pt-1">
          <Link
            href="/"
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "#4A7C59" }}
          >
            ← Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
