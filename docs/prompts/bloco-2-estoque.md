# Prompt — Bloco 2: Estoque

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

O módulo de Estoque cobre três páginas:

1. `/estoque` — visão geral com totais e tabela de produtos em estoque
2. `/estoque/movimentacoes` — lista de movimentações (saídas e ajustes)
3. `/estoque/nova-movimentacao` — formulário para registrar nova movimentação

Nenhuma dessas páginas existe ainda.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js para fazer proxy ao backend.
Toda chamada do browser vai para `/api/*` → Next.js intercepta → encaminha ao backend com cookies.

Padrão (veja `src/app/api/products/route.ts`):

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

Para POST com body:

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/rota-no-backend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

---

## Arquivos a ler antes de alterar

1. `apps/web/src/components/ui/sidebar.tsx` — para adicionar links de Estoque
2. `apps/web/src/app/api/products/route.ts` — padrão GET de route handler
3. `apps/web/src/app/dof/page.tsx` — referência de estrutura: cards + tabela + loading
4. `apps/web/src/app/madeiras/cadastro/page.tsx` — referência de formulário com POST

---

## O que os endpoints retornam

Antes de implementar, inspecione os JSON reais:

```bash
curl -s http://localhost:3000/api/stock | python -m json.tool | head -40
curl -s http://localhost:3000/api/stock/products | python -m json.tool | head -40
curl -s http://localhost:3000/api/movements | python -m json.tool | head -40
curl -s http://localhost:3000/api/products | python -m json.tool | head -20
```

Estrutura esperada (adapte aos campos reais):

**`GET /stock`**
```json
{
  "totalVolume_m3": 347.82,
  "totalQuantity": 1240,
  "speciesCount": 8,
  "products": [...],
  "species": [...]
}
```

**`GET /stock/products`**
```json
[
  {
    "id": 1,
    "wood_type": "Cedro",
    "common_name": "Cedro-rosa",
    "height_cm": 5,
    "width_cm": 15,
    "length_m": 3,
    "quantity": 120,
    "volume_m3": 27.0
  }
]
```

**`GET /movements`**
```json
[
  {
    "id": 1,
    "type": "saida",
    "productId": 1,
    "quantity": 5,
    "volume_m3": 0.1125,
    "date": "2026-05-07",
    "observation": "Venda cliente X",
    "product": { "wood_type": "Cedro", "common_name": "Cedro-rosa" }
  }
]
```

> **Use os campos reais que o backend retornar.** Documente os campos reais no JSON de resultado.

---

## Implementação

### Passo 1 — Adicionar links na sidebar

**Arquivo a editar:** `apps/web/src/components/ui/sidebar.tsx`

Adicione o grupo "Estoque" com os seguintes itens, seguindo o padrão dos grupos existentes:

```
Estoque
  ├── Visão Geral → /estoque
  └── Movimentações → /estoque/movimentacoes
```

Cada link deve ficar ativo quando a rota atual corresponder exatamente (ou for subitem).

---

### Passo 2 — Criar route handlers

**`apps/web/src/app/api/stock/route.ts`** — GET /stock

**`apps/web/src/app/api/stock/products/route.ts`** — GET /stock/products

**`apps/web/src/app/api/movements/route.ts`** — GET e POST /movements

Para o handler de movements, implemente tanto GET quanto POST no mesmo arquivo:

```ts
export async function GET(request: NextRequest) { /* ... */ }
export async function POST(request: NextRequest) { /* ... */ }
```

---

### Passo 3 — Página `/estoque` (Visão Geral)

**Arquivo a criar:** `apps/web/src/app/estoque/page.tsx`

Client Component (`"use client"`).

#### Estrutura

```
[Título "Estoque"]
[3 cards: Volume Total (m³) | Quantidade Total | Espécies]
[Filtro por espécie + Tabela de produtos]
```

#### Busca de dados

Use `GET /api/stock/products` para a tabela.
Use `GET /api/stock` para os totais dos cards.

Ou, se `GET /api/stock` já retornar tudo (produtos + totais), use só ele.

```ts
const [stockData, setStockData] = useState<StockData | null>(null);
const [filter, setFilter] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get("/api/stock")
    .then((res) => setStockData(res.data))
    .catch(() => setStockData(null))
    .finally(() => setLoading(false));
}, []);
```

#### Filtro por espécie

Filtro local — sem nova chamada à API:

```ts
const filtered = stockData?.products.filter((p) =>
  filter === "" || p.wood_type.toLowerCase().includes(filter.toLowerCase())
) ?? [];
```

Campo de filtro:

```tsx
<input
  type="text"
  placeholder="Filtrar por espécie..."
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="px-3 py-2 text-sm rounded-xl border"
  style={{
    borderColor: "rgba(44,26,14,0.15)",
    backgroundColor: "#FFFFFF",
    color: "#2C1A0E",
    outline: "none",
  }}
/>
```

#### Cards de resumo

| Card | Campo | Cor |
| ---- | ----- | --- |
| Volume Total | `totalVolume_m3` + ` m³` | Verde `#2D6A4F` |
| Quantidade Total | `totalQuantity` + ` unid.` | Marrom `#8B5E3C` |
| Espécies | `speciesCount` | Escuro `#2C1A0E` |

#### Tabela de produtos

Colunas: **Espécie | Nome Comum | Dimensões | Quantidade | Volume (m³)**

Dimensões formatadas: `{height_cm}cm × {width_cm}cm × {length_m}m`

Estado vazio quando `filtered.length === 0`:
```tsx
<tr>
  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#A89888" }}>
    Nenhum produto encontrado.
  </td>
</tr>
```

---

### Passo 4 — Página `/estoque/movimentacoes` (Lista)

**Arquivo a criar:** `apps/web/src/app/estoque/movimentacoes/page.tsx`

Client Component (`"use client"`).

#### Estrutura

```
[Título "Movimentações" + Botão "Nova Movimentação" → /estoque/nova-movimentacao]
[Tabela de movimentações]
```

#### Busca de dados

```ts
useEffect(() => {
  api.get("/api/movements")
    .then((res) => setMovements(res.data))
    .catch(() => setMovements([]))
    .finally(() => setLoading(false));
}, []);
```

#### Tabela de movimentações

Colunas: **Data | Tipo | Produto | Qtde | Volume (m³) | Observação**

Badge de tipo:

```ts
function badgeMovimento(type: string): React.CSSProperties {
  return type === "saida"
    ? { backgroundColor: "#FEE2E2", color: "#991B1B" }
    : { backgroundColor: "#EEF4FB", color: "#1D4E89" };
}

function labelMovimento(type: string): string {
  return type === "saida" ? "Saída" : "Ajuste";
}
```

Botão "Nova Movimentação":

```tsx
<a
  href="/estoque/nova-movimentacao"
  className="px-4 py-2 text-sm font-semibold rounded-xl"
  style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
>
  Nova Movimentação
</a>
```

---

### Passo 5 — Página `/estoque/nova-movimentacao` (Formulário)

**Arquivo a criar:** `apps/web/src/app/estoque/nova-movimentacao/page.tsx`

Client Component (`"use client"`).

#### Campos do formulário

| Campo | Tipo | Obrigatório | Observação |
| ----- | ---- | ----------- | ---------- |
| Tipo | select (`saida` \| `ajuste`) | Sim | Label: "Tipo" |
| Produto | select (lista de `GET /api/products`) | Sim | Label: "Produto" |
| Quantidade | number (> 0) | Sim | Label: "Quantidade" |
| Data | date | Não | Padrão: data atual |
| Observação | textarea | Não | Label: "Observação" |

Carregue a lista de produtos ao montar o componente:

```ts
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  api.get("/api/products").then((res) => setProducts(res.data));
}, []);
```

#### Submissão

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSubmitting(true);
  setError("");
  try {
    await api.post("/api/movements", {
      type,
      productId: Number(productId),
      quantity: Number(quantity),
      date: date || undefined,
      observation: observation || undefined,
    });
    router.push("/estoque/movimentacoes");
  } catch (err: any) {
    setError(err?.response?.data?.message ?? "Erro ao registrar movimentação.");
  } finally {
    setSubmitting(false);
  }
}
```

Use `useRouter` do `next/navigation` para o redirect.

#### Validação client-side

Antes do POST, verifique:
- `type` não está vazio
- `productId` não está vazio
- `quantity > 0`

Exiba mensagem de erro inline se inválido (sem alert()).

#### Exibição de erro da API

```tsx
{error && (
  <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>
)}
```

---

## Design — padrão de container

Mesmo padrão das páginas existentes:

```tsx
<div className="p-6 space-y-6" style={{ backgroundColor: "#F5F1E6", minHeight: "100vh" }}>
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
      Título
    </h1>
  </div>
  {/* conteúdo */}
</div>
```

Cards brancos (container de tabelas e cards de resumo):

```
style={{ backgroundColor: "#FFFFFF", borderRadius: "1rem", boxShadow: "0 2px 8px rgba(44,26,14,0.05)", border: "1px solid rgba(44,26,14,0.07)" }}
```

---

## Validação — execute após implementar

### V1 — Route handlers existem

```bash
test -f apps/web/src/app/api/stock/route.ts && echo "stock ok" || echo "stock falhou"
test -f apps/web/src/app/api/stock/products/route.ts && echo "stock/products ok" || echo "stock/products falhou"
test -f apps/web/src/app/api/movements/route.ts && echo "movements ok" || echo "movements falhou"
```

### V2 — Route handlers usam API_URL e passam cookies

```bash
grep -l "API_URL" apps/web/src/app/api/stock/route.ts apps/web/src/app/api/stock/products/route.ts apps/web/src/app/api/movements/route.ts
```

Esperado: 3 arquivos listados.

### V3 — Páginas existem com "use client"

```bash
head -1 apps/web/src/app/estoque/page.tsx
head -1 apps/web/src/app/estoque/movimentacoes/page.tsx
head -1 apps/web/src/app/estoque/nova-movimentacao/page.tsx
```

Esperado: todas com `"use client"`.

### V4 — Sidebar tem links de estoque

```bash
grep -n "/estoque" apps/web/src/components/ui/sidebar.tsx
```

Esperado: ao menos 2 linhas (`/estoque` e `/estoque/movimentacoes`).

### V5 — Página de estoque busca /api/stock

```bash
grep -n "api/stock" apps/web/src/app/estoque/page.tsx
```

### V6 — Formulário faz POST para /api/movements

```bash
grep -n "api/movements\|api\.post" apps/web/src/app/estoque/nova-movimentacao/page.tsx
```

Esperado: linha com POST para `/api/movements`.

### V7 — Endpoints backend respondem

> Só execute se o backend (porta 3000) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/stock | python -m json.tool | head -10
curl -s http://localhost:3000/api/movements | python -m json.tool | head -10
```

### V8 — Proxy Next.js responde

> Só execute se o Next.js (porta 3001) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/stock | python -m json.tool | head -10
curl -s http://localhost:3001/api/movements | python -m json.tool | head -10
```

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 2,
  "nome": "Estoque",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "<editado | erro>" },
    { "arquivo": "apps/web/src/app/api/stock/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/api/stock/products/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/api/movements/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/estoque/page.tsx", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/estoque/movimentacoes/page.tsx", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/estoque/nova-movimentacao/page.tsx", "acao": "<criado | erro>" }
  ],
  "validacoes": {
    "V1_route_handlers_existem": "<ok | parcial | falhou>",
    "V2_route_handlers_padrao": "<ok | parcial | falhou>",
    "V3_use_client": "<ok | parcial | falhou>",
    "V4_sidebar_links": "<ok | falhou>",
    "V5_estoque_busca_api": "<ok | falhou>",
    "V6_form_post_movements": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V7_endpoints_backend": "<ok | parcial | falhou | skip>",
    "frontend_running": "<true | false>",
    "V8_endpoints_proxy": "<ok | parcial | falhou | skip>"
  },
  "campos_stock": [],
  "campos_stock_product_item": [],
  "campos_movement_item": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_stock`: campos reais retornados pela raiz de `GET /api/stock` (ex: `["totalVolume_m3", "totalQuantity", "speciesCount", "products", "species"]`)
>
> `campos_stock_product_item`: campos de cada item em `GET /api/stock/products` ou equivalente
>
> `campos_movement_item`: campos de cada item em `GET /api/movements`
>
> Documente o contrato real do backend para futuras sessões.
