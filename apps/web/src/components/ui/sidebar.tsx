"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import api from "@/services/api";

const navItems = [
  {
    label: "Início",
    href: "/dashboard",
    icon: (
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
    ),
  },
  {
    label: "Madeiras",
    icon: (
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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
        />
      </svg>
    ),
    children: [{ label: "Cadastro", href: "/madeiras/cadastro" }],
  },
  {
    label: "Estoque",
    icon: (
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
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    children: [
      { label: "Visão Geral", href: "/estoque" },
      {
        label: "Nova Movimentação",
        href: "/estoque/nova-movimentacao",
      },
      { label: "Movimentações", href: "/estoque/movimentacoes" },
    ],
  },
  {
    label: "Administração",
    icon: (
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    children: [
      { label: "Usuários", href: "/administracao/usuarios" },
      { label: "Perfis", href: "/administracao/perfis" },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // abre automaticamente o submenu da rota atual
    return navItems
      .filter((item) =>
        item.children?.some((child) => pathname.startsWith(child.href)),
      )
      .map((item) => item.label);
  });

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  async function logout(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.log(err);
    }
    localStorage.removeItem("user");
    sessionStorage.clear();
    router.replace("/");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-56 flex flex-col transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: "#2C1A0E" }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex-shrink-0 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Image
            src="/images/sigma.png"
            alt="Sigma"
            width={140}
            height={45}
            priority
          />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md"
            style={{ color: "rgba(245,241,230,0.50)" }}
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const isOpen = openMenus.includes(item.label);

            // Item simples (sem filhos)
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={
                    isActive
                      ? { backgroundColor: "#2D6A4F", color: "#FFFFFF" }
                      : { color: "rgba(245,241,230,0.60)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "#F5F1E6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(245,241,230,0.60)";
                    }
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            }

            // Item com submenus
            const hasActiveChild = item.children.some((child) =>
              pathname.startsWith(child.href),
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={
                    hasActiveChild
                      ? { color: "#F5F1E6" }
                      : { color: "rgba(245,241,230,0.60)" }
                  }
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.color = "#F5F1E6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color =
                      hasActiveChild ? "#F5F1E6" : "rgba(245,241,230,0.60)";
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span style={{ opacity: hasActiveChild ? 1 : 0.7 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Submenus */}
                {isOpen && (
                  <div
                    className="mt-0.5 ml-3 pl-4 space-y-0.5"
                    style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className="flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                          style={
                            isChildActive
                              ? { backgroundColor: "#2D6A4F", color: "#FFFFFF" }
                              : { color: "rgba(245,241,230,0.55)" }
                          }
                          onMouseEnter={(e) => {
                            if (!isChildActive) {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                "rgba(255,255,255,0.07)";
                              (e.currentTarget as HTMLElement).style.color =
                                "#F5F1E6";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isChildActive) {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "transparent";
                              (e.currentTarget as HTMLElement).style.color =
                                "rgba(245,241,230,0.55)";
                            }
                          }}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sair */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium transition-colors"
            style={{ color: "rgba(245,241,230,0.45)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#F5F1E6")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "rgba(245,241,230,0.45)")
            }
            onClick={logout}
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sair
          </Link>
        </div>
      </aside>
    </>
  );
}
