# Prompt — Bloco 5: Lotes de Entrada

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

O módulo de Lotes cobre duas páginas:

1. `/lotes` — lista de lotes de entrada com DOF
2. `/lotes/novo` — formulário para registrar novo lote (com itens dinâmicos)

Nenhuma das páginas existe ainda. Verifique se a sidebar já tem os links antes de editar.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js. Toda chamada do browser vai para `/api/*` → Next.js intercepta → encaminha ao backend com cookies.

Padrão GET/POST (veja `src/app/api/suppliers/route.ts`):

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/lots`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/lots`, {
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

### IMPORTANTE — Next.js 16: params é uma Promise

Em rotas dinâmicas `[id]/route.ts`, o padrão **obrigatório** é:

```ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // ...
}
```

**Nunca use** o padrão antigo `{ params: { id: string } }` diretamente — não funciona no Next.js 16.

---

## Arquivos a ler antes de alterar

1. `apps/web/src/components/ui/sidebar.tsx` — verificar se links de lotes já existem
2. `apps/web/src/app/api/suppliers/route.ts` — padrão GET/POST
3. `apps/web/src/app/api/suppliers/[id]/route.ts` — padrão com `Promise<params>` já implementado
4. `apps/web/src/app/fornecedores/page.tsx` — referência de estrutura e modal
5. `apps/web/src/app/estoque/nova-movimentacao/page.tsx` — referência de formulário com redirect

---

## O que os endpoints retornam

Antes de implementar, inspecione:

```bash
curl -s http://localhost:3000/api/lots | python -m json.tool | head -60
curl -s http://localhost:3000/api/suppliers | python -m json.tool | head -20
curl -s http://localhost:3000/api/products | python -m json.tool | head -20
```

Estrutura esperada de `GET /lots` (adapte aos campos reais):

```json
[
  {
    "id": 1,
    "dofNumber": "DOF-2026-00123",
    "supplierId": 1,
    "supplier": { "id": 1, "name": "Madeireira SP" },
    "entryDate": "2026-05-07",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 10,
        "volume_m3": 2.25,
        "product": { "wood_type": "Cedro", "common_name": "Cedro-rosa", "unit_volume_m3": 0.225 }
      }
    ]
  }
]
```

> **Use os campos reais que o backend retornar.** Documente no JSON de resultado.

---

## Implementação

### Passo 1 — Verificar e adicionar links na sidebar

**Arquivo:** `apps/web/src/components/ui/sidebar.tsx`

Execute antes de editar:

```bash
grep -n "/lotes" apps/web/src/components/ui/sidebar.tsx
```

- Se já existe: não editar.
- Se não existe: adicionar grupo ou itens "Lotes" com:
  - Lista → `/lotes`
  - Novo Lote → `/lotes/novo` (pode ser omitido da sidebar se preferir, já que há botão na lista)

Siga o padrão dos grupos existentes.

---

### Passo 2 — Criar route handler

**`apps/web/src/app/api/lots/route.ts`** — GET e POST

Siga o padrão descrito acima.

> Não é necessário criar `[id]/route.ts` para este bloco (não há edição de lotes na UI).

---

### Passo 3 — Página `/lotes` (Lista)

**Arquivo a criar:** `apps/web/src/app/lotes/page.tsx`

Client Component (`"use client"`).

#### Estrutura

```
[Título "Lotes de Entrada" + Botão "Novo Lote" → /lotes/novo]
[Tabela de lotes]
```

#### Busca de dados

```ts
useEffect(() => {
  api.get("/api/lots")
    .then((res) => setLots(res.data))
    .catch(() => setLots([]))
    .finally(() => setLoading(false));
}, []);
```

#### Tabela de lotes

Colunas: **Número DOF | Fornecedor | Data de Entrada | Itens | Volume Total (m³)**

- "Itens" = `lot.items.length` (contagem)
- "Volume Total" = soma de `item.volume_m3` de todos os itens

```ts
function totalVolume(items: LotItem[]): string {
  return items.reduce((acc, i) => acc + i.volume_m3, 0).toFixed(4);
}
```

- Data formatada: `new Date(lot.entryDate).toLocaleDateString("pt-BR")`

Estado vazio:

```tsx
<tr>
  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#A89888" }}>
    Nenhum lote cadastrado.
  </td>
</tr>
```

Botão "Novo Lote":

```tsx
<a
  href="/lotes/novo"
  className="px-4 py-2 text-sm font-semibold rounded-xl"
  style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF" }}
>
  Novo Lote
</a>
```

---

### Passo 4 — Página `/lotes/novo` (Formulário)

**Arquivo a criar:** `apps/web/src/app/lotes/novo/page.tsx`

Client Component (`"use client"`).

#### Campos fixos do formulário

| Campo | Tipo | Obrigatório |
| ----- | ---- | ----------- |
| Número DOF | text | Sim |
| Fornecedor | select (de `GET /api/suppliers`) | Sim |
| Data de entrada | date | Sim (padrão: hoje) |

#### Itens dinâmicos

Cada linha da tabela de itens tem:
- **Produto** — select de `GET /api/products`
- **Quantidade** — number (> 0)
- **Volume** — calculado automaticamente (`product.unit_volume_m3 × quantity`), somente leitura

Botão "Adicionar item" insere nova linha. Botão "Remover" por linha remove a linha.

```ts
interface LotItemForm {
  productId: string;
  quantity: number;
  unit_volume_m3: number; // preenchido ao selecionar produto
}

const [items, setItems] = useState<LotItemForm[]>([{ productId: "", quantity: 1, unit_volume_m3: 0 }]);
```

Quando o usuário seleciona um produto, atualizar `unit_volume_m3`:

```ts
function handleProductChange(index: number, productId: string) {
  const product = products.find((p) => String(p.id) === productId);
  setItems((prev) =>
    prev.map((item, i) =>
      i === index
        ? { ...item, productId, unit_volume_m3: product?.unit_volume_m3 ?? 0 }
        : item
    )
  );
}
```

Volume calculado por linha (somente leitura):

```tsx
<td className="px-3 py-2 text-sm" style={{ color: "#7A6555" }}>
  {(item.unit_volume_m3 * item.quantity).toFixed(4)} m³
</td>
```

#### Carregamento das listas

```ts
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  Promise.all([
    api.get("/api/suppliers"),
    api.get("/api/products"),
  ]).then(([suppRes, prodRes]) => {
    setSuppliers(suppRes.data);
    setProducts(prodRes.data);
  });
}, []);
```

#### Validação antes do POST

```ts
if (!dofNumber.trim()) { setError("Número DOF é obrigatório."); return; }
if (!supplierId) { setError("Selecione um fornecedor."); return; }
if (!entryDate) { setError("Data de entrada é obrigatória."); return; }
if (items.length === 0) { setError("Adicione ao menos 1 item."); return; }
if (items.some((i) => !i.productId || i.quantity <= 0)) {
  setError("Todos os itens precisam de produto e quantidade > 0.");
  return;
}
```

#### Submissão

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  // validações acima...
  setSubmitting(true); setError("");
  try {
    await api.post("/api/lots", {
      dofNumber,
      supplierId: Number(supplierId),
      entryDate,
      items: items.map((i) => ({
        productId: Number(i.productId),
        quantity: i.quantity,
      })),
    });
    router.push("/lotes");
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 409) {
      setError("Número de DOF já cadastrado.");
    } else if (status === 404) {
      setError("Fornecedor ou produto não encontrado.");
    } else {
      setError(err?.response?.data?.message ?? "Erro ao registrar lote.");
    }
  } finally {
    setSubmitting(false);
  }
}
```

Use `useRouter` do `next/navigation` para o redirect.

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
</div>
```

Cards brancos (tabelas e seções):

```
style={{ backgroundColor: "#FFFFFF", borderRadius: "1rem", boxShadow: "0 2px 8px rgba(44,26,14,0.05)", border: "1px solid rgba(44,26,14,0.07)" }}
```

---

## Validação — execute após implementar

### V1 — Route handler existe

```bash
test -f apps/web/src/app/api/lots/route.ts && echo "ok" || echo "falhou"
```

### V2 — Route handler usa API_URL e passa cookies

```bash
grep -n "API_URL\|Cookie" apps/web/src/app/api/lots/route.ts
```

Esperado: ao menos 2 linhas.

### V3 — Páginas existem com "use client"

```bash
head -1 apps/web/src/app/lotes/page.tsx
head -1 apps/web/src/app/lotes/novo/page.tsx
```

Esperado: ambas com `"use client"`.

### V4 — Sidebar tem link /lotes

```bash
grep -n "/lotes" apps/web/src/components/ui/sidebar.tsx
```

Esperado: ao menos 1 linha.

### V5 — Formulário faz POST para /api/lots

```bash
grep -n "api/lots\|api\.post" apps/web/src/app/lotes/novo/page.tsx
```

### V6 — Volume calculado em tempo real (sem chamada à API)

```bash
grep -n "unit_volume_m3\|toFixed" apps/web/src/app/lotes/novo/page.tsx
```

Esperado: ao menos 2 linhas.

### V7 — Endpoint backend responde

> Só execute se o backend (porta 3000) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/lots | python -m json.tool | head -20
```

### V8 — Proxy Next.js responde

> Só execute se o Next.js (porta 3001) estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/lots | python -m json.tool | head -20
```

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 5,
  "nome": "Lotes",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "<editado | já existia — sem alteração | erro>" },
    { "arquivo": "apps/web/src/app/api/lots/route.ts", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/lotes/page.tsx", "acao": "<criado | erro>" },
    { "arquivo": "apps/web/src/app/lotes/novo/page.tsx", "acao": "<criado | erro>" }
  ],
  "validacoes": {
    "V1_route_handler_existe": "<ok | falhou>",
    "V2_route_handler_padrao": "<ok | falhou>",
    "V3_use_client": "<ok | falhou>",
    "V4_sidebar_link": "<ok | falhou>",
    "V5_post_lots": "<ok | falhou>",
    "V6_volume_calculado": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V7_endpoint_backend": "<ok | falhou | skip>",
    "frontend_running": "<true | false>",
    "V8_endpoint_proxy": "<ok | falhou | skip>"
  },
  "campos_lot_item": [],
  "campos_lot_item_line": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_lot_item`: campos reais de cada lote em `GET /api/lots`
> (ex: `["id", "dofNumber", "supplierId", "supplier", "entryDate", "items"]`)
>
> `campos_lot_item_line`: campos de cada item dentro de `lot.items`
> (ex: `["id", "productId", "quantity", "volume_m3", "product"]`)
