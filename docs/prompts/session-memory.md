# Memória de Sessão — Sigma Frontend

> Use este arquivo para retomar o trabalho após limite de contexto ou troca de sessão.
> Atualize a seção "Estado atual" sempre que concluir um bloco.

---

## Como retomar uma sessão

1. Leia `docs/prompts/visao-geral.md` — arquitetura, domínio, convenções
2. Leia este arquivo — estado atual e próximos passos
3. Leia `docs/implementation-map.md` — critérios de aceite de cada bloco
4. Leia `docs/api.md` — referência dos endpoints antes de implementar

---

## Contexto desta sessão (2026-05-09)

### O que foi feito nesta sessão

| Item | Status |
| ---- | ------ |
| Swagger exportado da API local | Feito |
| `docs/api.md` criado com referência completa dos endpoints | Feito |
| `docs/implementation-map.md` criado com blocos e critérios de aceite | Feito |
| `docs/prompts/bloco-0-proxy.md` criado com prompt completo para o agente | Feito |
| `docs/prompts/visao-geral.md` criado | Feito |
| `docs/prompts/session-memory.md` criado | Feito |
| Bloco 0 (Proxy) executado pelo agente | Feito |

---

## Estado atual do frontend (snapshot 2026-05-09)

### Proxy — arquitetura real descoberta no Bloco 0

O projeto usa **dois mecanismos de proxy em camadas**:

1. **Route Handlers** (`src/app/api/**/*.ts`) — proxy manual por rota, com repasse explícito de cookies `HttpOnly`. Existem handlers para: `auth/*`, `products`, `products/[id]`, `users`, `users/[id]`, `profiles`, `profiles/[id]`.
2. **Rewrites** (`next.config.ts`) — catch-all genérico para qualquer `/api/*` sem handler dedicado.

Variáveis de ambiente em `apps/web/.env.local`:

```env
BACKEND_URL=http://localhost:3000        # usada pelos rewrites
API_URL=http://localhost:3000            # usada pelos route handlers (server-side)
NEXT_PUBLIC_API_URL=http://localhost:3000  # usada pelos handlers de auth (legado)
```

**Padrão a seguir ao criar novos route handlers:**

```ts
// GET com cookie forwarding
export async function GET(request: NextRequest) {
  const res = await fetch(`${process.env.API_URL}/rota`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

### Implementado e funcional

- Login (`/`) — conectado à API, cookies, redirect
- Cadastro de Madeiras (`/madeiras/cadastro`) — CRUD completo, conectado à API
- Administração de Usuários (`/administracao/usuarios`) — CRUD (em andamento)
- Administração de Perfis (`/administracao/perfis`) — existe
- Forgot Password / Reset Password — existem
- Layout shell (`DashboardClient` + `sidebar`) — responsivo, funcional
- Dashboard (`/dashboard`) — cards e atividade recente conectados à API real
- DOF (`/dof`) — conformidade por espécie, badges conforme/atencao/irregular
- Estoque (`/estoque`, `/estoque/movimentacoes`, `/estoque/nova-movimentacao`) — conectados à API real
- Fornecedores (`/fornecedores`) — CRUD completo com modal, formatação CNPJ
- Lotes (`/lotes`, `/lotes/novo`) — lista e formulário com itens dinâmicos e volume em tempo real
- Desmembramentos (`/estoque/desmembramentos`) — lista + formulário inline, estorno via DELETE

### Implementado mas vazio (não conectado à API)

_(nenhum no momento)_

### Não existe ainda

- `/estoque` e subpáginas
- `/dof`
- `/fornecedores`
- `/lotes` e subpáginas
- Desmembramentos

---

## Ordem de blocos e status

| Bloco | Nome | Status | Prompt |
| ----- | ---- | ------ | ------ |
| 0 | Proxy Next.js → Backend | **CONCLUÍDO** | `docs/prompts/bloco-0-proxy.md` |
| 1 | Dashboard | **CONCLUÍDO** | `docs/prompts/bloco-1-dashboard.md` |
| 2 | Estoque | **CONCLUÍDO** | `docs/prompts/bloco-2-estoque.md` |
| 3 | DOF | **CONCLUÍDO** | `docs/prompts/bloco-3-dof.md` |
| 4 | Fornecedores | **CONCLUÍDO** | `docs/prompts/bloco-4-fornecedores.md` |
| 5 | Lotes | **CONCLUÍDO** | `docs/prompts/bloco-5-lotes.md` |
| 6 | Desmembramentos | **CONCLUÍDO** | `docs/prompts/bloco-6-desmembramentos.md` |

---

## Resultado JSON do último bloco executado

```json
{
  "bloco": 6,
  "nome": "Desmembramentos",
  "status": "ok",
  "campos_dismemberment_item": ["id", "originProductId", "originProduct", "originQuantity", "originVolume_m3", "date", "user", "userId", "items"],
  "campos_dest_item": ["id", "dismembermentId", "destinationProductId", "destinationProduct", "quantity", "volume_m3"],
  "observacoes": "Backend em /dismemberments (sem prefixo /api). DashboardClient aplicado corretamente — V3.5 ok."
}
```

```json
{
  "bloco": 5,
  "nome": "Lotes",
  "status": "ok",
  "observacoes": "Backend retornou [] em GET /lots (banco vazio). unit_volume_m3 presente nos produtos conforme API. Campos de lot_item não verificados ao vivo por falta de dados."
}
```

```json
{
  "bloco": 4,
  "nome": "Fornecedores",
  "status": "ok",
  "campos_supplier_item": ["id", "name", "cnpj", "contact"],
  "erros": [],
  "observacoes": "Route handler [id]/route.ts usa padrão real do Next.js 16: context: { params: Promise<{ id: string }> } + await context.params. O exemplo no prompt usava o padrão antigo. Sempre usar o padrão com Promise em rotas dinâmicas."
}
```

```json
{
  "bloco": 2,
  "nome": "Estoque",
  "status": "ok",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/app/api/stock/route.ts", "acao": "criado" },
    { "arquivo": "apps/web/src/app/api/stock/products/route.ts", "acao": "criado" },
    { "arquivo": "apps/web/src/app/api/movements/route.ts", "acao": "criado" },
    { "arquivo": "apps/web/src/app/estoque/page.tsx", "acao": "criado" },
    { "arquivo": "apps/web/src/app/estoque/movimentacoes/page.tsx", "acao": "criado" },
    { "arquivo": "apps/web/src/app/estoque/nova-movimentacao/page.tsx", "acao": "criado" }
  ],
  "campos_stock": ["totalQuantity", "totalVolume_m3", "productCount", "speciesCount", "products", "species"],
  "campos_stock_product_item": ["productId", "product.id", "product.wood_type", "product.common_name", "product.scientific_name", "product.height_cm", "product.width_cm", "product.length_m", "product.unit_volume_m3", "product.active", "quantity", "volume_m3"],
  "campos_movement_item": ["id", "type", "productId", "product", "quantity", "volume_m3", "date", "userId", "user", "observation"],
  "erros": [],
  "observacoes": "Sidebar já tinha os links de Estoque de sessão anterior. Backend usa /stock (sem prefixo /api). Produtos em GET /stock são objetos aninhados { productId, product: {...}, quantity, volume_m3 }."
}
```

```json
{
  "bloco": 3,
  "nome": "DOF",
  "status": "ok",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/components/ui/sidebar.tsx", "acao": "editado" },
    { "arquivo": "apps/web/src/app/api/dof/route.ts", "acao": "criado" },
    { "arquivo": "apps/web/src/app/dof/page.tsx", "acao": "criado" }
  ],
  "validacoes": {
    "V1_route_handler_existe": "ok",
    "V2_route_handler_padrao": "ok",
    "V3_use_client": "ok",
    "V4_busca_dof": "ok",
    "V5_sidebar_link": "ok",
    "backend_running": "true",
    "V6_endpoint_backend": "ok",
    "frontend_running": "true",
    "V7_endpoint_proxy": "ok",
    "V8_visual_ok": "skip"
  },
  "campos_summary": ["speciesCount", "conformingCount", "warningCount", "irregularCount", "totalCubagem_m3", "totalDof_m3", "activeDofs"],
  "campos_dof_item": ["common_name", "scientific_name", "totalCubagem_m3", "totalDof_m3", "difference_m3", "divergence_pct", "status", "activeDofs"],
  "erros": [],
  "observacoes": "O backend não retorna DOFs individuais — retorna conformidade por espécie. O array se chama 'species' (não 'dofs'). Status real: 'conforme' | 'atencao' | 'irregular' (não 'ativo' | 'em_alerta'). A página foi adaptada a essa estrutura real."
}
```

```json
{
  "bloco": 1,
  "nome": "Dashboard",
  "status": "ok",
  "arquivos_alterados": [
    { "arquivo": "apps/web/src/app/api/dashboard/route.ts", "acao": "criado" },
    { "arquivo": "apps/web/src/app/dashboard/page.tsx", "acao": "editado" }
  ],
  "validacoes": {
    "V1_route_handler_existe": "ok",
    "V2_route_handler_padrao": "ok",
    "V3_use_client": "ok",
    "V4_busca_dashboard": "ok",
    "V5_sem_hardcoded": "ok",
    "backend_running": "true",
    "V6_endpoint_backend": "ok",
    "frontend_running": "true",
    "V7_endpoint_proxy": "ok"
  },
  "campos_latestActivity": ["type", "date", "description"],
  "erros": [],
  "observacoes": "Backend expõe /dashboard (sem prefixo /api). latestActivity retornou [] — estado vazio exibido. Proxy Next.js em :3001 respondeu corretamente."
}
```

---

## Instruções para o agente ao retomar

1. **Todos os blocos (0–6) estão concluídos.** O frontend está completo para o MVP.

2. Antes de implementar qualquer bloco, leia os arquivos que serão alterados para não sobrescrever código existente.

3. **Ao criar novos route handlers**, siga o padrão com `API_URL` e `Cookie` forwarding documentado acima.

4. Ao concluir um bloco, atualize este arquivo:
   - Mude o `Status` na tabela de blocos
   - Cole o JSON de resultado na seção "Resultado JSON do último bloco executado"
   - Atualize o "Estado atual do frontend" se necessário

5. Se um bloco falhar parcialmente, registre o que foi feito e o que faltou antes de encerrar.

---

## Decisões e restrições registradas

- **Proxy obrigatório:** toda chamada do browser passa pelo Next.js via route handler ou rewrite.
- **Novos endpoints:** criar route handler em `src/app/api/<rota>/route.ts` seguindo o padrão com `API_URL`.
- **Sem dependências novas** sem aprovação explícita do usuário.
- **Sem componentes separados** para estruturas usadas uma vez.
- **Tabelas HTML nativas** com Tailwind — sem `<Table>` do shadcn.
- **DOF é prioridade** após dashboard — é o módulo central do sistema.
- **Dados mockados não são usados** — tudo conectado à API real.
- **DashboardClient obrigatório:** toda página autenticada deve envolver o return em `<DashboardClient title="..." subtitle="...">`. Nunca usar `<div className="p-6..." style={{ backgroundColor: "#F5F1E6" }}>` como raiz. O `DashboardClient` já provê sidebar, header e background. Não incluir `<h1>` interno — o title vai como prop. Fix aplicado retroativamente via `docs/prompts/fix-dashboard-layout.md`.
- **Next.js 16 — rotas dinâmicas:** `params` é uma `Promise`. Padrão obrigatório em `[id]/route.ts`:
  ```ts
  export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    // ...
  }
  ```
  Nunca usar o padrão antigo `{ params: { id: string } }` diretamente.
