# Prompt — Bloco 4: Fornecedores

> Você é um agente de implementação. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON conforme especificado.

---

## Contexto

O módulo de Fornecedores é uma única página `/fornecedores` com CRUD completo:
listagem, criação, edição e remoção — tudo via modal (sem páginas separadas).

A página não existe ainda. Verifique se a sidebar já tem o link antes de editar.

---

## Arquitetura de proxy — obrigatório ler antes de implementar

O projeto usa **route handlers** Next.js. Toda chamada do browser vai para `/api/*` → Next.js intercepta → encaminha ao backend com cookies.

Padrão (veja `src/app/api/products/route.ts` e `src/app/api/products/[id]/route.ts`):

```ts
// GET / POST — src/app/api/suppliers/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/suppliers`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/suppliers`, {
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

```ts
// PUT / DELETE — src/app/api/suppliers/[id]/route.ts
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const res = await fetch(`${process.env.API_URL}/suppliers/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.API_URL}/suppliers/${params.id}`, {
    method: "DELETE",
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

> **Importante:** verifique se já existe `src/app/api/suppliers/route.ts` antes de criar.
> Se existir, leia e adapte — não sobrescreva sem ler.

---

## Arquivos a ler antes de alterar

1. `apps/web/src/components/ui/sidebar.tsx` — verificar se o link já existe
2. `apps/web/src/app/api/products/route.ts` e `apps/web/src/app/api/products/[id]/route.ts` — padrão de handlers com `[id]`
3. `apps/web/src/app/madeiras/cadastro/page.tsx` — referência de modal de criação/edição inline

---

## O que os endpoints retornam

Antes de implementar, inspecione:

```bash
curl -s http://localhost:3000/api/suppliers | python -m json.tool
```

Estrutura esperada (adapte aos campos reais):

```json
[
  {
    "id": 1,
    "name": "Madeireira São Paulo Ltda",
    "cnpj": "12345678000199",
    "contact": "contato@madeireira.com.br"
  }
]
```

---

## Implementação

### Passo 1 — Verificar e adicionar link na sidebar

**Arquivo:** `apps/web/src/components/ui/sidebar.tsx`

Execute antes de editar:

```bash
grep -n "/fornecedores" apps/web/src/components/ui/sidebar.tsx
```

- Se já existe: não editar.
- Se não existe: adicionar item simples "Fornecedores → /fornecedores" seguindo o padrão existente.

---

### Passo 2 — Criar route handlers

**`apps/web/src/app/api/suppliers/route.ts`** — GET e POST

**`apps/web/src/app/api/suppliers/[id]/route.ts`** — PUT e DELETE

Siga o padrão descrito na seção de arquitetura acima.

---

### Passo 3 — Criar a página `/fornecedores`

**Arquivo a criar:** `apps/web/src/app/fornecedores/page.tsx`

Client Component (`"use client"`).

#### Estrutura geral

```
[Título "Fornecedores" + Botão "Novo Fornecedor"]
[Tabela de fornecedores]
[Modal de criação/edição (condicional)]
```

#### Estado

```ts
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [loading, setLoading] = useState(true);
const [modalOpen, setModalOpen] = useState(false);
const [editing, setEditing] = useState<Supplier | null>(null); // null = criação, objeto = edição
const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);

// Campos do formulário
const [name, setName] = useState("");
const [cnpj, setCnpj] = useState("");
const [contact, setContact] = useState("");
```

#### Busca de dados

```ts
function loadSuppliers() {
  setLoading(true);
  api.get("/api/suppliers")
    .then((res) => setSuppliers(res.data))
    .catch(() => setSuppliers([]))
    .finally(() => setLoading(false));
}

useEffect(() => { loadSuppliers(); }, []);
```

#### Tabela

Colunas: **Nome | CNPJ | Contato | Ações**

CNPJ formatado na exibição (não no campo de entrada):

```ts
function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
```

Coluna "Ações" com dois botões por linha:

```tsx
<td className="px-4 py-3">
  <div className="flex gap-2">
    <button
      onClick={() => openEdit(supplier)}
      className="px-3 py-1 text-xs font-semibold rounded-lg"
      style={{ backgroundColor: "#EEF4FB", color: "#1D4E89" }}
    >
      Editar
    </button>
    <button
      onClick={() => handleDelete(supplier.id)}
      className="px-3 py-1 text-xs font-semibold rounded-lg"
      style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
    >
      Remover
    </button>
  </div>
</td>
```

#### Abrir modal

```ts
function openCreate() {
  setEditing(null);
  setName(""); setCnpj(""); setContact(""); setError("");
  setModalOpen(true);
}

function openEdit(supplier: Supplier) {
  setEditing(supplier);
  setName(supplier.name);
  setCnpj(supplier.cnpj);
  setContact(supplier.contact ?? "");
  setError("");
  setModalOpen(true);
}
```

#### Submissão (criar ou editar)

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!name.trim() || cnpj.replace(/\D/g, "").length !== 14) {
    setError("Nome e CNPJ (14 dígitos) são obrigatórios.");
    return;
  }
  setSubmitting(true); setError("");
  try {
    const payload = { name, cnpj: cnpj.replace(/\D/g, ""), contact: contact || undefined };
    if (editing) {
      await api.put(`/api/suppliers/${editing.id}`, payload);
    } else {
      await api.post("/api/suppliers", payload);
    }
    setModalOpen(false);
    loadSuppliers();
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 409) {
      setError("CNPJ já cadastrado para outro fornecedor.");
    } else {
      setError(err?.response?.data?.message ?? "Erro ao salvar fornecedor.");
    }
  } finally {
    setSubmitting(false);
  }
}
```

#### Remoção

```ts
async function handleDelete(id: number) {
  if (!confirm("Remover este fornecedor?")) return;
  try {
    await api.delete(`/api/suppliers/${id}`);
    loadSuppliers();
  } catch (err: any) {
    alert(err?.response?.data?.message ?? "Não foi possível remover o fornecedor.");
  }
}
```

> Se a API retornar erro ao remover (ex: fornecedor tem lotes vinculados), o `alert()` é aceitável aqui pois é uma ação destrutiva pontual.

#### Modal

Modal simples inline (sem biblioteca). Exibido quando `modalOpen === true`:

```tsx
{modalOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: "rgba(44,26,14,0.4)" }}
  >
    <div
      className="w-full max-w-md p-6 space-y-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "1rem",
        boxShadow: "0 8px 32px rgba(44,26,14,0.15)",
      }}
    >
      <h2 className="text-lg font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
        {editing ? "Editar Fornecedor" : "Novo Fornecedor"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Campo Nome */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#8B7355" }}>Nome *</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border"
            style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
          />
        </div>

        {/* Campo CNPJ */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#8B7355" }}>CNPJ * (14 dígitos)</label>
          <input
            value={cnpj} onChange={(e) => setCnpj(e.target.value)}
            placeholder="00000000000000"
            maxLength={18}
            className="w-full px-3 py-2 text-sm rounded-xl border font-mono"
            style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
          />
        </div>

        {/* Campo Contato */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#8B7355" }}>Contato (opcional)</label>
          <input
            value={contact} onChange={(e) => setContact(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border"
            style={{ borderColor: "rgba(44,26,14,0.15)", color: "#2C1A0E" }}
          />
        </div>

        {error && <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm rounded-xl"
            style={{ backgroundColor: "#F5F1E6", color: "#8B7355" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ backgroundColor: "#2D6A4F", color: "#FFFFFF", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## Validação — execute após implementar

### V1 — Route handlers existem

```bash
test -f apps/web/src/app/api/suppliers/route.ts && echo "ok" || echo "falhou"
test -f apps/web/src/app/api/suppliers/[id]/route.ts && echo "ok" || echo "falhou"
```

### V2 — Route handlers usam API_URL e passam cookies

```bash
grep -n "API_URL\|Cookie" apps/web/src/app/api/suppliers/route.ts
grep -n "API_URL\|Cookie" apps/web/src/app/api/suppliers/[id]/route.ts
```

Esperado: ao menos 2 linhas em cada arquivo.

### V3 — Página existe com "use client"

```bash
head -1 apps/web/src/app/fornecedores/page.tsx
```

Esperado: `"use client"`

### V4 — Sidebar tem link /fornecedores

```bash
grep -n "/fornecedores" apps/web/src/components/ui/sidebar.tsx
```

Esperado: ao menos 1 linha.

### V5 — Página faz GET, POST, PUT, DELETE via api.*

```bash
grep -n "api\.get\|api\.post\|api\.put\|api\.delete" apps/web/src/app/fornecedores/page.tsx
```

Esperado: 4 linhas (uma de cada verbo).

### V6 — formatCnpj está implementado

```bash
grep -n "formatCnpj\|replace.*\\$1" apps/web/src/app/fornecedores/page.tsx
```

### V7 — Endpoint backend responde

> Só execute se o backend estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3000/api/suppliers | python -m json.tool | head -20
```

### V8 — Proxy Next.js responde

> Só execute se o Next.js estiver rodando. Caso contrário, marque `skip`.

```bash
curl -s http://localhost:3001/api/suppliers | python -m json.tool | head -20
```

---

## Resultado esperado — JSON de saída

```json
{
  "bloco": 4,
  "nome": "Fornecedores",
  "status": "<ok | parcial | falhou>",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "<editado | já existia — sem alteração | erro>" },
    { "arquivo": "apps/web/src/app/api/suppliers/route.ts", "acao": "<criado | já existia — lido e mantido | erro>" },
    { "arquivo": "apps/web/src/app/api/suppliers/[id]/route.ts", "acao": "<criado | já existia — lido e mantido | erro>" },
    { "arquivo": "apps/web/src/app/fornecedores/page.tsx", "acao": "<criado | erro>" }
  ],
  "validacoes": {
    "V1_route_handlers_existem": "<ok | falhou>",
    "V2_route_handlers_padrao": "<ok | falhou>",
    "V3_use_client": "<ok | falhou>",
    "V4_sidebar_link": "<ok | falhou>",
    "V5_verbos_http": "<ok | falhou>",
    "V6_format_cnpj": "<ok | falhou>",
    "backend_running": "<true | false>",
    "V7_endpoint_backend": "<ok | falhou | skip>",
    "frontend_running": "<true | false>",
    "V8_endpoint_proxy": "<ok | falhou | skip>"
  },
  "campos_supplier_item": [],
  "erros": [],
  "observacoes": ""
}
```

> `campos_supplier_item`: campos reais retornados por item em `GET /api/suppliers`
> (ex: `["id", "name", "cnpj", "contact"]`).
