# Mapa de Implementação — Frontend Sigma

> Este documento é o contrato de entrega do frontend.
> Cada bloco tem: **o que fazer**, **como validar** e **critérios de aceite**.
> O agente orquestrador deve seguir esta ordem e marcar cada critério antes de avançar.

---

## Regra de Ouro: Next.js como Proxy

**Toda chamada HTTP do browser deve passar pelo Next.js.**
O browser nunca fala diretamente com o backend.

```
Browser → Next.js (/api/*) → Backend (porta 3000)
```

### Por que isso importa
- Cookies `HttpOnly` funcionam corretamente (sem CORS)
- A URL do backend nunca é exposta ao cliente
- O `access_token` e `refresh_token` trafegam de forma segura

### Como funciona
`next.config.ts` configura `rewrites()` que redireciona `/api/*` → `http://backend:3000/api/*`
O `api.ts` do cliente usa baseURL relativa (`/`) — sem `NEXT_PUBLIC_*` exposto.

---

## BLOCO 0 — Proxy Next.js → Backend

**Prioridade: BLOQUEANTE. Nada mais funciona sem isso.**

### O que implementar

**`apps/web/next.config.ts`**
```ts
rewrites: async () => [
  {
    source: '/api/:path*',
    destination: 'http://<BACKEND_HOST>:3000/api/:path*',
  },
]
```

**`apps/web/src/services/api.ts`**
- `baseURL` deve ser `/` (relativa) — sem `NEXT_PUBLIC_APP_URL`
- `withCredentials: true` permanece
- Interceptor de 401/refresh permanece, mas chamando `/api/auth/refresh` (relativo)

**`.env.local` (novo)**
```
BACKEND_URL=http://localhost:3000
```
Essa variável é server-side only (sem `NEXT_PUBLIC_`).

### Critérios de aceite
- [ ] `api.ts` não contém `NEXT_PUBLIC_APP_URL`
- [ ] `next.config.ts` tem bloco `rewrites` apontando para `BACKEND_URL`
- [ ] Login funciona: browser → `/api/auth/login` → backend → cookie definido
- [ ] Network tab do browser mostra `Request URL: http://localhost:3001/api/...` (porta do Next, não do backend)
- [ ] Cookie `access_token` aparece em Application → Cookies após login
- [ ] Logout limpa os cookies

---

## BLOCO 1 — Dashboard

**Depende de:** Bloco 0

### O que implementar

**`apps/web/src/app/dashboard/page.tsx`**
- Buscar `GET /api/dashboard` no `useEffect`
- Preencher os 4 cards com dados reais:
  - `summary.totalStockVolume_m3` → "Estoque (m³)"
  - `summary.activeDofs` → "DOFs Ativos"
  - `summary.speciesCount` → "Espécies"
  - `summary.dofAlerts` → "Alertas DOF"
- Remover cards de "Vendas" e "Clientes" (não existem na API)
- Substituir "Atividade Recente" vazia pela `latestActivity` (10 itens)
  - Tabela simples: data, tipo (entrada/saída/desmembramento), produto, volume

### Critérios de aceite
- [ ] Os 4 cards mostram valores numéricos reais (não `"—"`)
- [ ] Tabela de atividade recente lista ao menos 1 item quando há dados
- [ ] Tabela mostra estado vazio correto quando `latestActivity` é `[]`
- [ ] Loading state visível enquanto `GET /api/dashboard` carrega
- [ ] Erro de rede não quebra a página (trata o catch)

---

## BLOCO 2 — Estoque

**Depende de:** Bloco 0

### O que implementar

**`apps/web/src/app/estoque/page.tsx`** — Visão Geral
- `GET /api/stock` para os totais (`totalVolume_m3`, `totalQuantity`, `speciesCount`)
- `GET /api/stock/products` para a tabela de produtos
- Tabela: espécie, nome comum, dimensões, qtde, volume (m³)
- Filtro visual por espécie (estado local, sem nova chamada)

**`apps/web/src/app/estoque/movimentacoes/page.tsx`** — Lista
- `GET /api/movements` para listar movimentações
- Tabela: data, tipo (`saida`/`ajuste`), produto, qtde, volume, observação

**`apps/web/src/app/estoque/nova-movimentacao/page.tsx`** — Criar
- Formulário com: tipo (select), produto (select de `GET /api/products`), qtde, observação, data
- `POST /api/movements` ao submeter
- Redirecionar para `/estoque/movimentacoes` após sucesso

### Critérios de aceite
- [ ] `/estoque` carrega e exibe dados reais do banco
- [ ] Filtro por espécie filtra a tabela visualmente (sem nova chamada)
- [ ] `/estoque/movimentacoes` lista todas as movimentações
- [ ] `/estoque/nova-movimentacao` cria movimentação e redireciona
- [ ] Validação client-side: tipo e produto são obrigatórios, qtde > 0
- [ ] Erro 404 (produto não encontrado) exibe mensagem, não quebra
- [ ] Sidebar marca a rota ativa corretamente em cada subrota

---

## BLOCO 3 — DOF (Controle de Documentos de Origem Florestal)

**Depende de:** Bloco 0
**Prioridade: ALTA — é o módulo central do sistema**

### O que implementar

**Adicionar na sidebar** (`sidebar.tsx`):
```
DOF → /dof (item simples, sem filhos)
```

**`apps/web/src/app/dof/page.tsx`**
- `GET /api/dof` para buscar dados
- 3 cards no topo: Ativos, Em alerta, Irregulares (de `summary`)
- Tabela: número DOF, fornecedor, volume autorizado (m³), volume consumido (m³), volume disponível (m³), status
- Badge de status:
  - `ativo` → `bg-green-100 text-green-800` "Ativo"
  - `em_alerta` → `bg-yellow-100 text-yellow-800` "Em alerta"
  - `irregular` → `bg-red-100 text-red-800` "Irregular"

### Critérios de aceite
- [ ] Link "DOF" aparece na sidebar e fica ativo em `/dof`
- [ ] Cards do topo mostram contagens corretas de `summary`
- [ ] Tabela lista todos os DOFs com badge colorido correto
- [ ] Quando não há DOFs, exibe estado vazio (não tabela vazia quebrada)
- [ ] Loading state durante a chamada

---

## BLOCO 4 — Fornecedores

**Depende de:** Bloco 0

### O que implementar

**Adicionar na sidebar** (`sidebar.tsx`):
```
Fornecedores → /fornecedores (item simples)
```

**`apps/web/src/app/fornecedores/page.tsx`**
- `GET /api/suppliers` para listar
- Tabela: nome, CNPJ (formatado), contato
- Botão "Novo Fornecedor" → modal de criação
- Modal: nome (obrigatório), CNPJ 14 dígitos (obrigatório), contato (opcional)
- `POST /api/suppliers` para criar
- Editar (`PUT /api/suppliers/:id`) e Remover (`DELETE /api/suppliers/:id`)

### Critérios de aceite
- [ ] Lista carrega fornecedores reais
- [ ] Criar fornecedor com CNPJ duplicado exibe erro 409 para o usuário
- [ ] CNPJ exibido formatado na tabela (`XX.XXX.XXX/XXXX-XX`)
- [ ] Remover bloqueia se houver lotes vinculados (exibe mensagem de erro da API)
- [ ] Modal fecha e lista atualiza após criar/editar

---

## BLOCO 5 — Lotes de Entrada

**Depende de:** Bloco 0, Bloco 4 (fornecedores devem existir para selecionar)

### O que implementar

**Adicionar na sidebar** (`sidebar.tsx`):
```
Lotes → /lotes, /lotes/novo
```

**`apps/web/src/app/lotes/page.tsx`** — Lista
- `GET /api/lots` para listar lotes
- Tabela: DOF, fornecedor, data de entrada, qtde de itens, volume total

**`apps/web/src/app/lotes/novo/page.tsx`** — Registro de entrada
- Campos: número DOF, fornecedor (select de `GET /api/suppliers`), data de entrada
- Tabela de itens dinâmica: produto (select de `GET /api/products`), quantidade → volume calculado automaticamente (`unit_volume_m3 × quantity`)
- Botão "Adicionar item" para incluir linhas
- Botão "Remover" por linha
- `POST /api/lots` ao submeter
- Redirecionar para `/lotes` após sucesso

### Critérios de aceite
- [ ] Lista de lotes carrega com dados reais
- [ ] Formulário exige ao menos 1 item antes de submeter
- [ ] Volume de cada item é calculado e exibido em tempo real (sem chamada à API)
- [ ] DOF duplicado exibe erro 409 ("Número de DOF já cadastrado")
- [ ] Fornecedor ou produto não encontrado exibe erro 404 amigável
- [ ] Redireciona para `/lotes` após sucesso

---

## BLOCO 6 — Desmembramentos

**Depende de:** Bloco 0, Bloco 2 (estoque deve existir)
**Prioridade: BAIXA para MVP**

### O que implementar

**`apps/web/src/app/estoque/desmembramentos/page.tsx`** — Lista
- `GET /api/dismemberments`
- Tabela: data, produto origem, qtde origem, produtos gerados, volumes

**Modal / página de novo desmembramento**
- Produto de origem (select) + quantidade
- Lista de produtos destino (dinâmica, igual a lotes)
- `POST /api/dismemberments`

### Critérios de aceite
- [ ] Lista carrega com dados reais
- [ ] Novo desmembramento debita origem e credita destinos
- [ ] Produto não encontrado exibe erro amigável
- [ ] Estorno funciona (DELETE remove e exibe mensagem de sucesso)

---

## Ordem de execução recomendada

```
BLOCO 0 → BLOCO 1 → BLOCO 3 → BLOCO 2 → BLOCO 4 → BLOCO 5 → BLOCO 6
  Proxy    Dashboard    DOF      Estoque  Fornecedor  Lotes    Desmembr.
```

DOF antes do Estoque porque é o módulo central para a apresentação acadêmica.

---

## Checklist geral (validação final antes de considerar completo)

### Proxy e autenticação
- [ ] Nenhuma chamada do browser vai diretamente para porta 3000
- [ ] Refresh automático de token funciona (simular expiração)
- [ ] Logout limpa cookies e redireciona para `/`
- [ ] Rota protegida sem cookie redireciona para `/` (ou `/unauthorized`)

### UX mínima obrigatória em toda página
- [ ] Loading state durante chamadas à API
- [ ] Estado vazio quando lista está vazia (sem tabela quebrada)
- [ ] Erro de rede tratado com mensagem para o usuário
- [ ] Sidebar marca a rota ativa corretamente

### Design system
- [ ] Segue paleta: `#2C1A0E` escuro, `#2D6A4F` verde, `#F5F1E6` fundo, `#8B5E3C` marrom
- [ ] Tipografia Georgia serif nos títulos, sans-serif no corpo
- [ ] Bordas `rounded-2xl`, sombras `0 2px 8px rgba(44,26,14,0.05)`
- [ ] Não instala novas dependências sem aprovação explícita
