import DashboardClient from "@/components/ui/DashboardClient";

const stats = [
  {
    label: "Produtos",
    value: "—",
    description: "cadastrados",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
        />
      </svg>
    ),
    color: "#8B5E3C",
    bg: "#FDF6EE",
  },
  {
    label: "Estoque",
    value: "—",
    description: "itens em estoque",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    color: "#2D6A4F",
    bg: "#F0FAF4",
  },
  {
    label: "Vendas",
    value: "—",
    description: "este mês",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "#1D4E89",
    bg: "#EEF4FB",
  },
  {
    label: "Clientes",
    value: "—",
    description: "cadastrados",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    color: "#6B3FA0",
    bg: "#F5F0FB",
  },
];

export default function DashboardPage() {
  return (
    <DashboardClient title="Dashboard" subtitle="Visão geral do sistema">
      {/* Stats */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#8B7355" }}
        >
          Visão Geral
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(44,26,14,0.07)",
                boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#A89888" }}>
                  {stat.description}
                </p>
              </div>
              <p
                className="text-xs font-semibold"
                style={{ color: stat.color }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Atividade Recente */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#8B7355" }}
        >
          Atividade Recente
        </h2>
        <div
          className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(44,26,14,0.07)",
            boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
            minHeight: "180px",
          }}
        >
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "#2C1A0E" }}>
            Nenhuma atividade registrada ainda
          </p>
          <p className="text-xs" style={{ color: "#A89888" }}>
            As ações do sistema aparecerão aqui
          </p>
        </div>
      </div>
    </DashboardClient>
  );
}
