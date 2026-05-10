# Visão Geral do Modelo — Sigma

> Leia este arquivo no início de qualquer sessão de trabalho neste projeto.
> Ele descreve a arquitetura, o domínio, as convenções e o estado atual do sistema.

---

## O que é o Sigma

Sistema de gestão para madeireiras. Controla estoque de madeira (por espécie e dimensão),
registros de entrada com DOF (Documento de Origem Florestal), saídas, desmembramentos e
conformidade legal com o IBAMA.

O módulo central é o **Controle DOF** — verifica se o volume físico em estoque
está dentro da tolerância de 10% do volume declarado no documento.

---

## Stack

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Frontend | Next.js 16 (App Router) | 3001 |
| Backend | NestJS (REST + Swagger) | 3000 |
| Banco | SQLite | — |
| Deploy | Docker Compose | — |

---

## Arquitetura de comunicação

```
Browser
  │
  │  /api/*  (relativo, nunca porta 3000)
  ▼
Next.js :3001
  │
  │  rewrites → http://localhost:3000/api/*
  ▼
NestJS :3000
  │
  ▼
SQLite
```

**Regra:** o browser nunca fala diretamente com o NestJS.
Toda chamada passa pelo proxy Next.js (`next.config.ts` → `rewrites`).
Cookies `HttpOnly` (`access_token` 15 min, `refresh_token` 7 dias) são gerenciados pelo NestJS
e trafegam de forma segura via proxy.

---

## Autenticação

- Login: `POST /api/auth/login` → define cookies `access_token` + `refresh_token`
- Refresh automático: interceptor em `api.ts` — ao receber 401, chama `POST /api/auth/refresh`
- Logout: `POST /api/auth/logout` → limpa cookies + `localStorage.removeItem("user")`
- User info: salvo em `localStorage` como `{ id, name, email }` após login

---

## Domínio — entidades principais

| Entidade | Descrição |
|----------|-----------|
| `Product` | Espécie + dimensão de madeira. Tem `unit_volume_m3` calculado automaticamente |
| `Supplier` | Fornecedor com CNPJ único |
| `Lot` (Lote) | Carga de entrada com número de DOF, fornecedor e itens |
| `LotItem` | Item de um lote: produto + quantidade + volume |
| `Movement` | Saída ou ajuste de estoque (tipo: `saida` \| `ajuste`) |
| `Dismemberment` | Transformação de produto A em produtos B, C... (ex: tora → pranchas) |
| `Stock` | View calculada: entradas − saídas − desmembramentos |
| `DOF` | View calculada: conformidade de volume por documento |

---

## Regra do DOF (negócio central)

Cada lote tem um número de DOF. O DOF declara um volume máximo autorizado.
O sistema calcula a divergência entre o volume físico em estoque e o volume do DOF:

```
divergência = (volume_estoque - volume_dof) / volume_dof × 100
```

| Divergência | Status | Badge |
|-------------|--------|-------|
| ≤ 10% | Ativo | Verde |
| 10% < x ≤ 15% | Em alerta | Amarelo |
| > 15% ou vencido | Irregular | Vermelho |

---

## Estrutura de arquivos do frontend

```
apps/web/src/
├── app/
│   ├── page.tsx                          ← Login
│   ├── layout.tsx                        ← Root layout (Plus Jakarta Sans)
│   ├── not-found.tsx
│   ├── unauthorized/page.tsx
│   ├── forgotPass/page.tsx
│   ├── reset-password/page.tsx
│   ├── dashboard/page.tsx                ← Dashboard (cards + atividade)
│   ├── madeiras/cadastro/page.tsx        ← CRUD de produtos (funcional)
│   ├── administracao/
│   │   ├── usuarios/page.tsx             ← CRUD usuários (em andamento)
│   │   └── perfis/page.tsx              ← CRUD perfis
│   └── [a criar]
│       ├── estoque/page.tsx
│       ├── estoque/movimentacoes/page.tsx
│       ├── estoque/nova-movimentacao/page.tsx
│       ├── dof/page.tsx                  ← PRIORITÁRIO
│       ├── fornecedores/page.tsx
│       ├── lotes/page.tsx
│       └── lotes/novo/page.tsx
├── components/ui/
│   ├── DashboardClient.tsx               ← Layout shell (sidebar + header)
│   ├── sidebar.tsx                       ← Navegação lateral
│   ├── card.tsx / button.tsx / input.tsx / label.tsx  ← shadcn/ui
└── services/
    └── api.ts                            ← Cliente axios (baseURL: "/")
```

---

## Design system

| Token | Valor | Uso |
|-------|-------|-----|
| Escuro | `#2C1A0E` | Sidebar, texto principal |
| Verde | `#2D6A4F` | Ações primárias, item ativo |
| Marrom | `#8B5E3C` | Acentos, ícones |
| Fundo | `#F5F1E6` | Background geral |
| Creme | `#FFFFFF` | Cards e superfícies |
| Muted | `#A89888` | Texto secundário |
| Border | `rgba(44,26,14,0.07)` | Bordas sutis |

Tipografia: **Georgia, serif** em títulos — **Plus Jakarta Sans** no corpo.
Bordas: `rounded-2xl`. Sombra padrão: `0 2px 8px rgba(44,26,14,0.05)`.

Badges DOF:
- Ativo: `bg-green-100 text-green-800`
- Em alerta: `bg-yellow-100 text-yellow-800`
- Irregular: `bg-red-100 text-red-800`

---

## Convenções de código

- Páginas são Server Components por padrão. Adicionar `"use client"` apenas quando necessário (useState, useEffect, eventos)
- Dados mockados **não são usados** — tudo conectado à API real
- Não instalar novas dependências sem aprovação
- Não criar componentes separados para estruturas usadas uma única vez
- Tabelas usam `<table>` HTML nativo com Tailwind (sem `<Table>` shadcn)
- Volume calculado em tempo real: `(height_cm × width_cm × length_m) / 10000`

---

## Referências

| Documento | Caminho |
|-----------|---------|
| API completa | `docs/api.md` |
| Mapa de implementação | `docs/implementation-map.md` |
| Prompt Bloco 0 (Proxy) | `docs/prompts/bloco-0-proxy.md` |
| Memória da sessão | `docs/prompts/session-memory.md` |
| Design | `docs/design.md` |
| Infraestrutura | `docs/infrastructure.md` |
| Modelo de dados | `docs/data-model.md` |
