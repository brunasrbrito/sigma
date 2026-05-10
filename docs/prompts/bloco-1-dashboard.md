# Prompt — Bloco 1: Dashboard

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

O Dashboard existe em `apps/web/src/app/dashboard/page.tsx` mas está estático:
cards mostram `"—"` e a seção de atividade recente exibe estado vazio hardcoded.

O backend expõe `GET /api/dashboard` que retorna dados reais consolidados.

O objetivo deste bloco é conectar a página ao endpoint real, sem alterar o layout existente.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js para fazer proxy ao backend.
Toda chamada do browser vai para `/api/*` → Next.js intercepta → encaminha ao backend com os cookies.

Padrão dos route handlers já existentes (veja `src/app/api/products/route.ts`):

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
- `BACKEND_URL=http://localhost:3000` — usado pelos rewrites genéricos

---

## Arquivos a ler antes de alterar

Leia estes arquivos antes de qualquer edição:

1. `apps/web/src/app/dashboard/page.tsx` — estado atual da página
2. `apps/web/src/app/api/products/route.ts` — padrão de route handler a seguir

---

## O que o endpoint retorna

`GET /api/dashboard` — resposta:

```json
{
  "summary": {
    "totalStockVolume_m3": 347.82,
    "totalStockQuantity": 1240,
    "activeDofs": 12,
    "speciesCount": 8,
    "productCount": 23,
    "dofAlerts": 2,
    "entriesCount": 45,
    "movementsCount": 103,
    "dismembermentsCount": 7
  },
  "dof": { },
  "latestActivity": [
    {
      "type": "entrada" | "saida" | "ajuste" | "desmembramento",
      "date": "2026-05-07",
      "description": "string descrevendo a atividade"
    }
  ]
}
```

> A forma exata de `latestActivity` pode variar. **Antes de implementar o template da tabela,
> faça uma chamada de teste ao endpoint e inspecione o JSON real** com:
> ```bash
> curl -s http://localhost:3000/api/dashboard | python -m json.tool
> ```
> Use os campos reais que o backend retornar. Se `latestActivity` vier vazio `[]`,
> exiba o estado vazio já existente na página.

---

## Implementação

### Passo 1 — Criar o route handler

**Arquivo a criar:** `apps/web/src/app/api/dashboard/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/dashboard`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

---

### Passo 2 — Atualizar a página do Dashboard

**Arquivo a editar:** `apps/web/src/app/dashboard/page.tsx`

A página precisa virar um Client Component (`"use client"`) para usar `useEffect` e `useState`.

#### O que remover

- Os 4 cards atuais (Produtos, Estoque, Vendas, Clientes) com valores `"—"`
- O array `stats` hardcoded no topo do arquivo

#### O que adicionar

**Interface de dados:**

```ts
interface DashboardSummary {
  totalStockVolume_m3: number;
  totalStockQuantity: number;
  activeDofs: number;
  speciesCount: number;
  dofAlerts: number;
}

interface ActivityItem {
  // adapte conforme os campos reais retornados pelo endpoint
  type: string;
  date: string;
  description: string;
}

interface DashboardData {
  summary: DashboardSummary;
  latestActivity: ActivityItem[];
}
```

**Busca dos dados:**

```ts
const [data, setData] = useState<DashboardData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get("/api/dashboard")
    .then((res) => setData(res.data))
    .catch(() => setData(null))
    .finally(() => setLoading(false));
}, []);
```

**Os 4 cards que devem aparecer:**

| Card | Campo | Descrição |
| ---- | ----- | --------- |
| Estoque Total | `summary.totalStockVolume_m3` + ` m³` | Volume total em estoque |
| DOFs Ativos | `summary.activeDofs` | Documentos de Origem Florestal ativos |
| Espécies | `summary.speciesCount` | Tipos distintos de madeira em estoque |
| Alertas DOF | `summary.dofAlerts` | DOFs em alerta ou irregular |

Manter as mesmas cores e ícones do layout atual — apenas substituir `label`, `value` e `description`.
Mapeamento sugerido:

```ts
const stats = data ? [
  {
    label: "Estoque Total",
    value: `${Number(data.summary.totalStockVolume_m3).toFixed(2)} m³`,
    description: "volume em estoque",
    // manter icon e colors existentes do card "Estoque"
  },
  {
    label: "DOFs Ativos",
    value: String(data.summary.activeDofs),
    description: "documentos ativos",
    // manter icon e colors existentes do card "Produtos"
  },
  {
    label: "Espécies",
    value: String(data.summary.speciesCount),
    description: "tipos de madeira",
    // manter icon e colors existentes do card "Clientes"
  },
  {
    label: "Alertas DOF",
    value: String(data.summary.dofAlerts),
    description: "requerem atenção",
    // usar cor vermelha (#DC2626 / bg #FEF2F2) para este card
  },
] : [];
```

**Loading state dos cards** — enquanto `loading === true`, exibir o skeleton:

```tsx
{loading ? (
  <div className="w-16 h-7 rounded animate-pulse" style={{ backgroundColor: "#E2D9CE" }} />
) : (
  <p className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
    {stat.value}
  </p>
)}
```

**Seção "Atividade Recente"** — substituir o estado vazio hardcoded por lógica real:

- Se `loading`: exibir spinner (igual ao já existente em `madeiras/cadastro/page.tsx`)
- Se `data?.latestActivity.length === 0` ou `data === null`: exibir o estado vazio atual (manter o SVG e textos)
- Se há itens: exibir tabela simples

Estrutura da tabela de atividade (adapte as colunas aos campos reais do endpoint):

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr style={{ borderBottom: "1px solid rgba(44,26,14,0.07)" }}>
        {["Data", "Tipo", "Descrição"].map((h) => (
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
      {data.latestActivity.map((item, i) => (
        <tr
          key={i}
          style={{
            borderBottom: i < data.latestActivity.length - 1
              ? "1px solid rgba(44,26,14,0.05)"
              : "none",
          }}
        >
          <td className="px-4 py-3 text-sm" style={{ color: "#7A6555" }}>
            {item.date}
          </td>
          <td className="px-4 py-3">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={badgeStyle(item.type)}
            >
              {labelTipo(item.type)}
            </span>
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: "#2C1A0E" }}>
            {item.description}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Helpers de badge — adapte os tipos ao que o backend retornar:

```ts
function badgeStyle(type: string) {
  const map: Record<string, React.CSSProperties> = {
    entrada:        { backgroundColor: "#F0FAF4", color: "#2D6A4F" },
    saida:          { backgroundColor: "#FEF2F2", color: "#DC2626" },
    ajuste:         { backgroundColor: "#EEF4FB", color: "#1D4E89" },
    desmembramento: { backgroundColor: "#FDF6EE", color: "#8B5E3C" },
  };
  return map[type] ?? { backgroundColor: "#F5F1E6", color: "#8B7355" };
}

function labelTipo(type: string) {
  const map: Record<string, string> = {
    entrada:        "Entrada",
    saida:          "Saída",
    ajuste:         "Ajuste",
    desmembramento: "Desmembramento",
  };
  return map[type] ?? type;
}
```

---

## Validação — execute após implementar

### V1 — Route handler existe

```bash
test -f apps/web/src/app/api/dashboard/route.ts && echo "ok" || echo "falhou"
```

### V2 — Route handler usa API_URL e passa cookies

```bash
grep -n "API_URL\|Cookie" apps/web/src/app/api/dashboard/route.ts
```

Esperado: 2 linhas.

### V3 — Página tem "use client"

```bash
head -1 apps/web/src/app/dashboard/page.tsx
```

Esperado: `"use client"`

### V4 — Página busca /api/dashboard

```bash
grep -n "api/dashboard\|api\.get" apps/web/src/app/dashboard/page.tsx
```

Esperado: linha contendo `/api/dashboard`.

### V5 — Cards não são mais hardcoded com "—"

```bash
grep -n '"—"' apps/web/src/app/dashboard/page.tsx
```

Esperado: nenhuma linha (grep retorna exit 1).

### V6 — Endpoint responde (servidor rodando)

> Só execute se o backend (porta 3000) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/dashboard | python -m json.tool | head -20
```

Esperado: JSON com `summary` e `latestActivity`.

### V7 — Proxy Next.js responde (frontend rodando)

> Só execute se o Next.js (porta 3001) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/dashboard | python -m json.tool | head -20
```

Esperado: mesmo JSON, desta vez via proxy.

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 1,
  "nome": "Dashboard",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/app/api/dashboard/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/dashboard/page.tsx", "acao": "<editado | erro>" }
  ],
  "validacoes": {
    "V1_route_handler_existe": "<ok | falhou>",
    "V2_route_handler_padrao": "<ok | falhou>",
    "V3_use_client": "<ok | falhou>",
    "V4_busca_dashboard": "<ok | falhou>",
    "V5_sem_hardcoded": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V6_endpoint_backend": "<ok | falhou | skip>",
    "frontend_running": "<true | false>",
    "V7_endpoint_proxy": "<ok | falhou | skip>"
  },
  "campos_latestActivity": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_latestActivity`: liste os campos reais que o endpoint retornou por item
> (ex: `["type", "date", "description"]`). Isso documenta o contrato real do backend.
