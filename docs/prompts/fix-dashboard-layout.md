# Prompt — Fix: Adicionar DashboardClient em todas as páginas

> Você é um agente de correção. Leia este prompt completo antes de fazer qualquer alteração.
> Ao final, execute a validação e retorne o resultado em JSON.

---

## Problema

As páginas criadas nos blocos 2–5 não têm sidebar nem header porque não usam o componente `DashboardClient`.
O layout correto exige que toda página autenticada envolva seu conteúdo com `<DashboardClient>`.

**Páginas corretas (referência):** `apps/web/src/app/madeiras/cadastro/page.tsx`
**Páginas incorretas (a corrigir):** todas listadas abaixo.

---

## Como funciona o DashboardClient

```tsx
import DashboardClient from "@/components/ui/DashboardClient";

// Props:
// - title: string (obrigatório) — aparece no header superior
// - subtitle?: string (opcional) — aparece abaixo do título no header

export default function MinhaPage() {
  // ... estados e lógica ...

  return (
    <DashboardClient title="Título da Página" subtitle="Subtítulo opcional">
      {/* conteúdo da página — sem wrapper externo de p-6 ou bg-color */}
      <div className="space-y-4">
        {/* ... */}
      </div>
    </DashboardClient>
  );
}
```

O `DashboardClient` já provê:
- Sidebar lateral com navegação
- Header superior com título, subtítulo e nome do usuário
- Background `#F5F1E6` e padding interno

---

## O que fazer em cada página

Para cada arquivo abaixo:

1. **Leia o arquivo completo** antes de editar
2. **Adicione o import** (se não existir):
   ```ts
   import DashboardClient from "@/components/ui/DashboardClient";
   ```
3. **Substitua o elemento raiz do return:**
   - Remova o `<div className="p-6 ...">` ou `<div style={{ backgroundColor: "#F5F1E6" ...}}>` mais externo
   - Substitua por `<DashboardClient title="..." subtitle="...">`
   - Atualize o fechamento correspondente: `</div>` → `</DashboardClient>`
4. **Remova o `<h1>` de título** que estava dentro do div externo (o DashboardClient já exibe o título no header)
   - Mantenha qualquer outro `<h2>`, labels ou subtítulos internos
5. **Mantenha todo o restante do conteúdo** exatamente como está — tabelas, formulários, modais, estados, etc.

---

## Páginas a corrigir

### 1. `apps/web/src/app/dof/page.tsx`

```
title="Controle DOF"
subtitle="Conformidade de volume por espécie"
```

### 2. `apps/web/src/app/estoque/page.tsx`

```
title="Estoque"
subtitle="Visão geral do estoque por produto"
```

### 3. `apps/web/src/app/estoque/movimentacoes/page.tsx`

```
title="Movimentações"
subtitle="Saídas e ajustes de estoque"
```

### 4. `apps/web/src/app/estoque/nova-movimentacao/page.tsx`

```
title="Nova Movimentação"
subtitle="Registrar saída ou ajuste de estoque"
```

### 5. `apps/web/src/app/fornecedores/page.tsx`

```
title="Fornecedores"
subtitle="Gerencie os fornecedores cadastrados"
```

### 6. `apps/web/src/app/lotes/page.tsx`

```
title="Lotes de Entrada"
subtitle="Registros de entrada com Documento de Origem Florestal"
```

### 7. `apps/web/src/app/lotes/novo/page.tsx`

```
title="Novo Lote"
subtitle="Registrar entrada de madeira com DOF"
```

---

## Exemplo de transformação

**Antes (errado):**
```tsx
return (
  <div className="p-6 space-y-6" style={{ backgroundColor: "#F5F1E6", minHeight: "100vh" }}>
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold" style={{ color: "#2C1A0E", fontFamily: "Georgia, serif" }}>
        Lotes de Entrada
      </h1>
      <a href="/lotes/novo" ...>Novo Lote</a>
    </div>
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "1rem" }}>
      {/* tabela */}
    </div>
  </div>
);
```

**Depois (correto):**
```tsx
return (
  <DashboardClient title="Lotes de Entrada" subtitle="Registros de entrada com Documento de Origem Florestal">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <a href="/lotes/novo" ...>Novo Lote</a>
      </div>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "1rem" }}>
        {/* tabela */}
      </div>
    </div>
  </DashboardClient>
);
```

> Note: o `<h1>` com o título da página foi removido pois o DashboardClient já o exibe no header.
> O botão e os demais elementos foram mantidos e agrupados num `<div className="space-y-4">`.

---

## Validação — execute após corrigir todas as páginas

### V1 — Todas as páginas importam DashboardClient

```bash
grep -l "DashboardClient" \
  apps/web/src/app/dof/page.tsx \
  apps/web/src/app/estoque/page.tsx \
  apps/web/src/app/estoque/movimentacoes/page.tsx \
  apps/web/src/app/estoque/nova-movimentacao/page.tsx \
  apps/web/src/app/fornecedores/page.tsx \
  apps/web/src/app/lotes/page.tsx \
  apps/web/src/app/lotes/novo/page.tsx
```

Esperado: 7 arquivos listados.

### V2 — Nenhuma página tem div com backgroundColor #F5F1E6 como raiz do return

```bash
grep -n "F5F1E6\|minHeight.*100vh" \
  apps/web/src/app/dof/page.tsx \
  apps/web/src/app/estoque/page.tsx \
  apps/web/src/app/estoque/movimentacoes/page.tsx \
  apps/web/src/app/estoque/nova-movimentacao/page.tsx \
  apps/web/src/app/fornecedores/page.tsx \
  apps/web/src/app/lotes/page.tsx \
  apps/web/src/app/lotes/novo/page.tsx
```

Esperado: nenhum resultado (o DashboardClient já provê esse estilo).

### V3 — Verificação visual (se frontend estiver rodando)

Acesse no browser e confirme que sidebar e header aparecem:
- `http://localhost:3001/dof`
- `http://localhost:3001/estoque`
- `http://localhost:3001/estoque/movimentacoes`
- `http://localhost:3001/estoque/nova-movimentacao`
- `http://localhost:3001/fornecedores`
- `http://localhost:3001/lotes`
- `http://localhost:3001/lotes/novo`

---

## Resultado esperado — JSON de saída

```json
{
  "fix": "dashboard-layout",
  "status": "<ok | parcial | falhou>",
  "arquivos_corrigidos": [
    { "arquivo": "apps/web/src/app/dof/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/estoque/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/estoque/movimentacoes/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/estoque/nova-movimentacao/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/fornecedores/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/lotes/page.tsx", "acao": "<corrigido | erro>" },
    { "arquivo": "apps/web/src/app/lotes/novo/page.tsx", "acao": "<corrigido | erro>" }
  ],
  "validacoes": {
    "V1_import_dashboardclient": "<ok | parcial | falhou>",
    "V2_sem_div_raiz_proprio": "<ok | parcial | falhou>",
    "frontend_running": "<true | false>",
    "V3_visual_ok": "<ok | parcial | falhou | skip>"
  },
  "erros": [],
  "observacoes": ""
}
```
