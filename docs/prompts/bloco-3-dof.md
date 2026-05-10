# Prompt — Bloco 3: DOF (Controle de Documentos de Origem Florestal)

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

O DOF é o módulo central do sistema Sigma. Controla a conformidade de volume entre o que está
fisicamente em estoque e o que foi declarado em cada Documento de Origem Florestal.

A página `/dof` não existe ainda. A sidebar também não tem o link para ela.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js para fazer proxy ao backend.
Toda chamada do browser vai para `/api/*` → Next.js intercepta → encaminha ao backend com os cookies.

Padrão dos route handlers existentes (veja `src/app/api/products/route.ts`):

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/rota-no-backend`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

Variáveis disponíveis em `.env.local`:
- `API_URL=http://localhost:3000` — usar nos route handlers (server-side)

---

## Arquivos a ler antes de alterar

Leia estes arquivos antes de qualquer edição:

1. `apps/web/src/components/ui/sidebar.tsx` — para adicionar o link DOF no lugar correto
2. `apps/web/src/app/api/products/route.ts` — padrão de route handler a seguir
3. `apps/web/src/app/dashboard/page.tsx` — referência de estrutura: cards + tabela + loading state

---

## O que o endpoint retorna

Antes de implementar, inspecione o JSON real:

```bash
curl -s http://localhost:3000/api/dof | python -m json.tool
```

Estrutura esperada (adapte aos campos reais):

```json
{
  "summary": {
    "active": 12,
    "alert": 2,
    "irregular": 1
  },
  "dofs": [
    {
      "dofNumber": "DOF-2026-00123",
      "supplier": "Madeireira São Paulo Ltda",
      "authorizedVolume_m3": 50.0,
      "consumedVolume_m3": 47.5,
      "availableVolume_m3": 2.5,
      "status": "em_alerta"
    }
  ]
}
```

> **Use os campos reais que o backend retornar.** Se os nomes diferirem do exemplo acima,
> adapte o código aos campos reais. Documente os campos reais no JSON de resultado.

---

## Implementação

### Passo 1 — Adicionar link na sidebar

**Arquivo a editar:** `apps/web/src/components/ui/sidebar.tsx`

Adicione o item DOF na lista de navegação, após "Dashboard" e antes de "Estoque" (ou na posição
mais lógica conforme a estrutura atual da sidebar). Use o mesmo padrão dos itens existentes.

O link deve:
- Apontar para `/dof`
- Ficar ativo (destaque visual) quando a rota atual for `/dof`
- Usar um ícone adequado — se a sidebar usa lucide-react, use `FileText` ou `ScrollText`

---

### Passo 2 — Criar o route handler

**Arquivo a criar:** `apps/web/src/app/api/dof/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/dof`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

---

### Passo 3 — Criar a página DOF

**Arquivo a criar:** `apps/web/src/app/dof/page.tsx`

A página deve ser um Client Component (`"use client"`).

#### Estrutura geral

```
[Título "Controle DOF"]
[3 cards de resumo]
[Tabela de DOFs]
```

#### Interfaces TypeScript

```ts
interface DofSummary {
  // adapte aos campos reais do endpoint
  active: number;
  alert: number;
  irregular: number;
}

interface DofItem {
  // adapte aos campos reais do endpoint
  dofNumber: string;
  supplier: string;
  authorizedVolume_m3: number;
  consumedVolume_m3: number;
  availableVolume_m3: number;
  status: "ativo" | "em_alerta" | "irregular";
}

interface DofData {
  summary: DofSummary;
  dofs: DofItem[];
}
```

#### Busca dos dados

```ts
const [data, setData] = useState<DofData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get("/api/dof")
    .then((res) => setData(res.data))
    .catch(() => setData(null))
    .finally(() => setLoading(false));
}, []);
```

#### Os 3 cards de resumo

| Card | Campo | Cor de destaque |
| ---- | ----- | --------------- |
| DOFs Ativos | `summary.active` | Verde `#2D6A4F` / fundo `#F0FAF4` |
| Em Alerta | `summary.alert` | Amarelo `#B45309` / fundo `#FFFBEB` |
| Irregulares | `summary.irregular` | Vermelho `#DC2626` / fundo `#FEF2F2` |

Loading state dos cards (enquanto `loading === true`):

```tsx
{loading ? (
  <div className="w-16 h-7 rounded animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
) : (
  <p className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
    {value}
  </p>
)}
```

#### Tabela de DOFs

Use `<table>` HTML nativo com Tailwind (sem componente shadcn Table).

Colunas: **Número DOF | Fornecedor | Vol. Autorizado (m³) | Vol. Consumido (m³) | Vol. Disponível (m³) | Status**

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
        {["Número DOF", "Fornecedor", "Vol. Autorizado (m³)", "Vol. Consumido (m³)", "Vol. Disponível (m³)", "Status"].map((h) => (
          <th
            key={h}
            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left"
            style={{ color: "#8B7355" }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.dofs.map((dof, i) => (
        <tr
          key={i}
          style={{
            borderBottom: i < data.dofs.length - 1
              ? "1px solid rgba(44,26,14,0.05)"
              : "none",
          }}
        >
          <td className="px-4 py-3 text-sm font-mono" style={{ color: "#2C1A0E" }}>
            {dof.dofNumber}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: "#2C1A0E" }}>
            {dof.supplier}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
            {Number(dof.authorizedVolume_m3).toFixed(4)}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
            {Number(dof.consumedVolume_m3).toFixed(4)}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
            {Number(dof.availableVolume_m3).toFixed(4)}
          </td>
          <td className="px-4 py-3">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={badgeStyle(dof.status)}
            >
              {labelStatus(dof.status)}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Helper de badge — use as classes Tailwind conforme o design system:

```ts
function badgeStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    ativo:       { backgroundColor: "#DCFCE7", color: "#166534" },
    em_alerta:   { backgroundColor: "#FEF9C3", color: "#854D0E" },
    irregular:   { backgroundColor: "#FEE2E2", color: "#991B1B" },
  };
  return map[status] ?? { backgroundColor: "#F5F1E6", color: "#8B7355" };
}

function labelStatus(status: string): string {
  const map: Record<string, string> = {
    ativo:     "Ativo",
    em_alerta: "Em alerta",
    irregular: "Irregular",
  };
  return map[status] ?? status;
}
```

#### Estados especiais

**Loading:**
```tsx
{loading && (
  <div className="flex justify-center py-12">
    <div className="w-8 h-8 border-4 rounded-full animate-spin"
      style={{ borderColor: "#E2D9CE", borderTopColor: "#2D6A4F" }} />
  </div>
)}
```

**Lista vazia (`data.dofs.length === 0`):**
```tsx
<div className="text-center py-12" style={{ color: "#A89888" }}>
  <p className="text-sm">Nenhum DOF cadastrado.</p>
</div>
```

**Erro de rede (`data === null` e `!loading`):**
```tsx
<div className="text-center py-12" style={{ color: "#DC2626" }}>
  <p className="text-sm">Não foi possível carregar os dados. Tente novamente.</p>
</div>
```

---

## Design — container padrão

Siga o mesmo padrão das páginas existentes. Container de página:

```tsx
<div className="p-6 space-y-6" style={{ backgroundColor: "#F5F1E6", minHeight: "100vh" }}>
  <h1 className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
    Controle DOF
  </h1>
  {/* cards */}
  {/* tabela dentro de card branco rounded-2xl com sombra */}
</div>
```

Cards brancos (container de tabela e de cada card de resumo):

```tsx
style={{
  backgroundColor: "#FFFFFF",
  borderRadius: "1rem",
  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
  border: "1px solid rgba(44,26,14,0.07)",
}}
```

---

## Validação — execute após implementar

### V1 — Route handler existe

```bash
test -f apps/web/src/app/api/dof/route.ts && echo "ok" || echo "falhou"
```

### V2 — Route handler usa API_URL e passa cookies

```bash
grep -n "API_URL\|Cookie" apps/web/src/app/api/dof/route.ts
```

Esperado: 2 linhas.

### V3 — Página existe e tem "use client"

```bash
head -1 apps/web/src/app/dof/page.tsx
```

Esperado: `"use client"`

### V4 — Página busca /api/dof

```bash
grep -n "api/dof\|api\.get" apps/web/src/app/dof/page.tsx
```

Esperado: linha contendo `/api/dof`.

### V5 — Sidebar tem link para /dof

```bash
grep -n "/dof" apps/web/src/components/ui/sidebar.tsx
```

Esperado: ao menos 1 linha.

### V6 — Endpoint backend responde

> Só execute se o backend (porta 3000) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/dof | python -m json.tool | head -20
```

Esperado: JSON com `summary` e `dofs`.

### V7 — Proxy Next.js responde

> Só execute se o Next.js (porta 3001) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/dof | python -m json.tool | head -20
```

Esperado: mesmo JSON via proxy.

### V8 — Link DOF aparece na sidebar ao navegar

Abra o browser em `http://localhost:3001/dof` e confirme visualmente:
- Link "DOF" aparece na sidebar
- Link fica com destaque ativo
- 3 cards de resumo visíveis
- Tabela carrega (ou estado vazio se não há dados)

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 3,
  "nome": "DOF",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "<editado | erro>" },
    { "arquivo": "apps/web/src/app/api/dof/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/dof/page.tsx", "acao": "<criado | erro>" }
  ],
  "validacoes": {
    "V1_route_handler_existe": "<ok | falhou>",
    "V2_route_handler_padrao": "<ok | falhou>",
    "V3_use_client": "<ok | falhou>",
    "V4_busca_dof": "<ok | falhou>",
    "V5_sidebar_link": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V6_endpoint_backend": "<ok | falhou | skip>",
    "frontend_running": "<true | false>",
    "V7_endpoint_proxy": "<ok | falhou | skip>",
    "V8_visual_ok": "<ok | falhou | skip>"
  },
  "campos_dof_item": [],
  "campos_summary": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_dof_item`: liste os campos reais retornados por item em `dofs[]`
> (ex: `["dofNumber", "supplier", "authorizedVolume_m3", "consumedVolume_m3", "availableVolume_m3", "status"]`).
>
> `campos_summary`: liste os campos reais de `summary`
> (ex: `["active", "alert", "irregular"]`).
>
> Isso documenta o contrato real do backend para futuras sessões.
