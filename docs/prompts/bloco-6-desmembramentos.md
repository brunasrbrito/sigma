# Prompt — Bloco 6: Desmembramentos

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

Desmembramento é a transformação de um produto em outros produtos.
Exemplo: 1 tora (produto A) → 4 pranchas (produto B).

A operação debita o produto de origem e credita os produtos destino no estoque.

Este módulo fica em `/estoque/desmembramentos` (subitem do Estoque) e tem duas partes:
1. **Lista** — tabela de desmembramentos registrados
2. **Novo desmembramento** — formulário inline na mesma página (modal ou seção expansível)

Verifique se a sidebar já tem o link antes de editar.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js. Padrão GET/POST (veja `src/app/api/lots/route.ts`):

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/dismemberments`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/dismemberments`, {
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

Para `DELETE /dismemberments/:id` — padrão com Next.js 16 (params é Promise):

```ts
// src/app/api/dismemberments/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const res = await fetch(`${process.env.API_URL}/dismemberments/${id}`, {
    method: "DELETE",
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

---

## Arquivos a ler antes de alterar

1. `apps/web/src/components/ui/sidebar.tsx` — verificar se link de desmembramentos existe
2. `apps/web/src/app/api/lots/route.ts` — padrão GET/POST
3. `apps/web/src/app/api/suppliers/[id]/route.ts` — padrão DELETE com Promise<params>
4. `apps/web/src/app/lotes/novo/page.tsx` — referência de formulário com itens dinâmicos

---

## O que o endpoint retorna

Antes de implementar, inspecione:

```bash
curl -s http://localhost:3000/api/dismemberments | python -m json.tool | head -60
curl -s http://localhost:3000/api/products | python -m json.tool | head -20
```

Estrutura esperada de `GET /dismemberments` (adapte aos campos reais):

```json
[
  {
    "id": 1,
    "date": "2026-05-07",
    "originProductId": 1,
    "originQuantity": 1,
    "originProduct": { "wood_type": "Cedro", "common_name": "Cedro-rosa", "unit_volume_m3": 0.225 },
    "items": [
      {
        "id": 1,
        "destinationProductId": 2,
        "quantity": 4,
        "volume_m3": 0.36,
        "destinationProduct": { "wood_type": "Cedro", "common_name": "Prancha" }
      }
    ]
  }
]
```

> **Use os campos reais que o backend retornar.** Documente no JSON de resultado.

---

## Implementação

### Passo 1 — Verificar e adicionar link na sidebar

**Arquivo:** `apps/web/src/components/ui/sidebar.tsx`

Execute antes de editar:

```bash
grep -n "/estoque/desmembramentos\|desmembramento" apps/web/src/components/ui/sidebar.tsx
```

- Se já existe: não editar.
- Se não existe: adicionar "Desmembramentos → `/estoque/desmembramentos`" como subitem do grupo Estoque.

---

### Passo 2 — Criar route handlers

**`apps/web/src/app/api/dismemberments/route.ts`** — GET e POST

**`apps/web/src/app/api/dismemberments/[id]/route.ts`** — DELETE

Siga os padrões descritos na seção de arquitetura acima.

---

### Passo 3 — Criar a página `/estoque/desmembramentos`

**Arquivo a criar:** `apps/web/src/app/estoque/desmembramentos/page.tsx`

Client Component (`"use client"`).

#### Estrutura geral

```
[Título "Desmembramentos" + Botão "Novo Desmembramento"]
[Formulário de novo desmembramento (colapsável ou exibido abaixo do botão)]
[Tabela de desmembramentos]
```

O formulário pode estar numa seção expansível (`showForm` state) ou num modal — escolha o padrão mais simples conforme as páginas existentes do projeto.

#### Busca de dados

```ts
const [dismemberments, setDismemberments] = useState<Dismemberment[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

function loadData() {
  Promise.all([
    api.get("/api/dismemberments"),
    api.get("/api/products"),
  ]).then(([dismRes, prodRes]) => {
    setDismemberments(dismRes.data);
    setProducts(prodRes.data);
  }).catch(() => {}).finally(() => setLoading(false));
}

useEffect(() => { loadData(); }, []);
```

#### Tabela de desmembramentos

Colunas: **Data | Produto Origem | Qtde Origem | Produtos Gerados | Ações**

- "Produtos Gerados" = lista resumida dos destinos: `"Prancha (×4), Caibro (×2)"`
- "Ações" = botão "Estornar" (DELETE)
- Data formatada: `new Date(d.date).toLocaleDateString("pt-BR")`

```ts
function resumeItems(items: DismembermentItem[]): string {
  return items
    .map((i) => `${i.destinationProduct?.common_name ?? i.destinationProductId} (×${i.quantity})`)
    .join(", ");
}
```

#### Estorno (DELETE)

```ts
async function handleEstorno(id: number) {
  if (!confirm("Estornar este desmembramento? O estoque será revertido.")) return;
  try {
    await api.delete(`/api/dismemberments/${id}`);
    loadData();
  } catch (err: any) {
    alert(err?.response?.data?.message ?? "Não foi possível estornar.");
  }
}
```

#### Formulário de novo desmembramento

Estado do formulário:

```ts
const [showForm, setShowForm] = useState(false);
const [originProductId, setOriginProductId] = useState("");
const [originQuantity, setOriginQuantity] = useState(1);
const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
const [destItems, setDestItems] = useState<DestItem[]>([
  { destinationProductId: "", quantity: 1 }
]);
const [formError, setFormError] = useState("");
const [submitting, setSubmitting] = useState(false);

interface DestItem {
  destinationProductId: string;
  quantity: number;
}
```

Campos fixos:

| Campo | Tipo | Obrigatório |
| ----- | ---- | ----------- |
| Produto de origem | select de `products` | Sim |
| Quantidade de origem | number (> 0) | Sim |
| Data | date | Sim (padrão: hoje) |

Itens destino dinâmicos (igual a `/lotes/novo`):
- Cada linha: select de produto destino + quantidade
- Botão "Adicionar destino" insere linha
- Botão "Remover" por linha

Validação antes do POST:

```ts
if (!originProductId) { setFormError("Selecione o produto de origem."); return; }
if (originQuantity <= 0) { setFormError("Quantidade de origem deve ser > 0."); return; }
if (destItems.length === 0) { setFormError("Adicione ao menos 1 produto destino."); return; }
if (destItems.some((i) => !i.destinationProductId || i.quantity <= 0)) {
  setFormError("Todos os destinos precisam de produto e quantidade > 0.");
  return;
}
```

Submissão:

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  // validações...
  setSubmitting(true); setFormError("");
  try {
    await api.post("/api/dismemberments", {
      originProductId: Number(originProductId),
      originQuantity,
      date,
      items: destItems.map((i) => ({
        destinationProductId: Number(i.destinationProductId),
        quantity: i.quantity,
      })),
    });
    setShowForm(false);
    // reset campos
    setOriginProductId(""); setOriginQuantity(1);
    setDestItems([{ destinationProductId: "", quantity: 1 }]);
    loadData();
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      setFormError("Produto de origem ou destino não encontrado.");
    } else {
      setFormError(err?.response?.data?.message ?? "Erro ao registrar desmembramento.");
    }
  } finally {
    setSubmitting(false);
  }
}
```

---

## Layout — DashboardClient obrigatório

Todas as páginas autenticadas usam `DashboardClient` como wrapper. **Não use `<div>` próprio com `p-6` ou `backgroundColor: "#F5F1E6"` como elemento raiz.**

```tsx
import DashboardClient from "@/components/ui/DashboardClient";
```

O `DashboardClient` recebe `title` e `subtitle` e renderiza o header + sidebar automaticamente.

Use para esta página:

```tsx
return (
  <DashboardClient title="Desmembramentos" subtitle="Transformação de produtos em estoque">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 text-sm font-semibold rounded-xl"
          style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
        >
          {showForm ? "Cancelar" : "Novo Desmembramento"}
        </button>
      </div>
      {/* formulário condicional */}
      {/* tabela */}
    </div>
  </DashboardClient>
);
```

> Não inclua `<h1>` de título — o `DashboardClient` já o exibe no header a partir do prop `title`.

Cards brancos:

```
style={{ backgroundColor: "#FFFFFF", borderRadius: "1rem", boxShadow: "0 2px 8px rgba(44,26,14,0.05)", border: "1px solid rgba(44,26,14,0.07)" }}
```

---

## Validação — execute após implementar

### V1 — Route handlers existem

```bash
test -f apps/web/src/app/api/dismemberments/route.ts && echo "ok" || echo "falhou"
test -f apps/web/src/app/api/dismemberments/[id]/route.ts && echo "ok" || echo "falhou"
```

### V2 — Route handlers usam API_URL e passam cookies

```bash
grep -n "API_URL\|Cookie" apps/web/src/app/api/dismemberments/route.ts
grep -n "API_URL\|Cookie" apps/web/src/app/api/dismemberments/[id]/route.ts
```

Esperado: ao menos 2 linhas em cada.

### V3 — Handler [id] usa padrão Next.js 16 (await context.params)

```bash
grep -n "await context.params\|Promise<" apps/web/src/app/api/dismemberments/[id]/route.ts
```

### V3.5 — Página usa DashboardClient (não div próprio como raiz)

```bash
grep -n "DashboardClient" apps/web/src/app/estoque/desmembramentos/page.tsx
```

Esperado: ao menos 1 linha (import + uso).

```bash
grep -n "F5F1E6\|minHeight.*100vh" apps/web/src/app/estoque/desmembramentos/page.tsx
```

Esperado: nenhum resultado.

Esperado: ao menos 1 linha.

### V4 — Página existe com "use client"

```bash
head -1 apps/web/src/app/estoque/desmembramentos/page.tsx
```

Esperado: `"use client"`

### V5 — Sidebar tem link /estoque/desmembramentos

```bash
grep -n "desmembramento" apps/web/src/components/ui/sidebar.tsx
```

Esperado: ao menos 1 linha.

### V6 — Página faz GET, POST e DELETE

```bash
grep -n "api\.get\|api\.post\|api\.delete" apps/web/src/app/estoque/desmembramentos/page.tsx
```

Esperado: 3 linhas (uma de cada verbo).

### V7 — Endpoint backend responde

> Só execute se o backend (porta 3000) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/dismemberments | python -m json.tool | head -10
```

### V8 — Proxy Next.js responde

> Só execute se o Next.js (porta 3001) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/dismemberments | python -m json.tool | head -10
```

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 6,
  "nome": "Desmembramentos",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "<editado | já existia — sem alteração | erro>" },
    { "arquivo": "apps/web/src/app/api/dismemberments/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/api/dismemberments/[id]/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/estoque/desmembramentos/page.tsx", "acao": "<criado | erro>" }
  ],
  "validacoes": {
    "V1_route_handlers_existem": "<ok | falhou>",
    "V2_route_handlers_padrao": "<ok | falhou>",
    "V3_params_promise": "<ok | falhou>",
    "V3_5_dashboard_client": "<ok | falhou>",
    "V4_use_client": "<ok | falhou>",
    "V5_sidebar_link": "<ok | falhou>",
    "V6_verbos_http": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V7_endpoint_backend": "<ok | falhou | skip>",
    "frontend_running": "<true | false>",
    "V8_endpoint_proxy": "<ok | falhou | skip>"
  },
  "campos_dismemberment_item": [],
  "campos_dest_item": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_dismemberment_item`: campos reais de cada desmembramento em `GET /api/dismemberments`
>
> `campos_dest_item`: campos de cada item dentro de `dismemberment.items`
