# Sigma API — Referência para o Frontend

Base URL: `http://localhost:3000/api`
Autenticação: cookies HTTP-only (`access_token` + `refresh_token`) definidos no login.

---

## Tags / Módulos

| Tag | Descrição |
|-----|-----------|
| `auth` | Autenticação e sessão |
| `users` | Usuários do sistema |
| `profiles` | Perfis de acesso |
| `products` | Produtos (espécies de madeira) |
| `suppliers` | Fornecedores |
| `lots` | Lotes de entrada com DOF |
| `stock` | Estoque atual |
| `movements` | Movimentações de saída e ajuste |
| `dismemberments` | Desmembramentos |
| `dof` | Controle de DOF |
| `dashboard` | Dashboard resumido |

---

## auth

### POST /auth/login
**Login** — Autentica com e-mail e senha. Define cookies `access_token` (15 min) e `refresh_token` (7 dias).

```json
// Body
{
  "email": "admin@sigma.com",
  "password": "Senha123!"
}
```

| Status | Descrição |
|--------|-----------|
| 200 | Login OK — cookies definidos |
| 401 | E-mail ou senha incorretos |

---

### POST /auth/refresh
**Renovar access_token** — Gera novo `access_token` a partir do `refresh_token`.

```json
// Body
{
  "refresh_token": "<jwt>"
}
```

| Status | Descrição |
|--------|-----------|
| 200 | Novo access_token retornado |
| 401 | Refresh token inválido ou expirado |

---

### POST /auth/logout
**Logout** — Limpa os cookies de sessão.

| Status | Descrição |
|--------|-----------|
| 200 | Sessão encerrada |

---

### POST /auth/forgot-password
**Solicitar redefinição de senha** — Envia e-mail com link (expira em 1h). Resposta sempre igual independente de o e-mail existir.

```json
// Body
{ "email": "usuario@sigma.com" }
```

| Status | Descrição |
|--------|-----------|
| 200 | Resposta enviada |

---

### POST /auth/reset-password
**Redefinir senha** — Usa token recebido por e-mail. Token é de uso único e expira em 1h.

```json
// Body
{
  "token": "<token-do-email>",
  "newPassword": "NovaSenha456!"
}
```

| Status | Descrição |
|--------|-----------|
| 200 | Senha redefinida |
| 400 | Token inválido ou expirado |

---

## users

### GET /users
**Listar usuários** — Retorna todos os usuários com perfil vinculado. Campo `passwordHash` nunca é retornado.

| Status | Descrição |
|--------|-----------|
| 200 | Array de usuários |

---

### POST /users
**Criar usuário** — Senha armazenada como hash bcrypt.

```json
// Body
{
  "name": "João Silva",
  "email": "joao@sigma.com",
  "password": "Senha123!",
  "profileId": 1,       // opcional
  "active": true         // padrão: true
}
```

| Status | Descrição |
|--------|-----------|
| 201 | Usuário criado |
| 409 | E-mail já cadastrado |

---

### GET /users/{id}
**Buscar usuário por ID**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id` | path | ID numérico do usuário |

| Status | Descrição |
|--------|-----------|
| 200 | Usuário encontrado |
| 404 | Não encontrado |

---

### PUT /users/{id}
**Atualizar usuário** — Todos os campos opcionais. Para senha use `PUT /users/:id/reset-password`.

| Status | Descrição |
|--------|-----------|
| 200 | Atualizado |
| 404 | Não encontrado |

---

### DELETE /users/{id}
**Remover usuário** — Exclusão permanente. Para desativar sem excluir use `PUT` com `{ "active": false }`.

| Status | Descrição |
|--------|-----------|
| 200 | Removido |
| 404 | Não encontrado |

---

### PUT /users/{id}/reset-password
**Redefinir senha do usuário** — Operação administrativa, sem necessidade de token.

```json
// Body
{ "newPassword": "NovaSenha456!" }
```

| Status | Descrição |
|--------|-----------|
| 200 | Senha redefinida |
| 404 | Não encontrado |

---

## profiles

### GET /profiles
**Listar perfis de acesso**

| Status | Descrição |
|--------|-----------|
| 200 | Array de perfis |

---

### POST /profiles
**Criar perfil**

```json
// Body
{ "name": "Admin" }
```

| Status | Descrição |
|--------|-----------|
| 201 | Perfil criado |

---

### GET /profiles/{id}
**Buscar perfil por ID**

| Status | Descrição |
|--------|-----------|
| 200 | Perfil encontrado |
| 404 | Não encontrado |

---

### PUT /profiles/{id}
**Renomear perfil**

```json
// Body
{ "name": "Supervisor" }
```

| Status | Descrição |
|--------|-----------|
| 200 | Atualizado |
| 404 | Não encontrado |

---

### DELETE /profiles/{id}
**Remover perfil** — Falha se houver usuários vinculados.

| Status | Descrição |
|--------|-----------|
| 200 | Removido |
| 404 | Não encontrado |

---

## products

### GET /products
**Listar produtos** — Cada produto é uma espécie/dimensão de madeira. `unit_volume_m3` calculado automaticamente.

| Status | Descrição |
|--------|-----------|
| 200 | Array de produtos |

---

### POST /products
**Criar produto**

```json
// Body
{
  "wood_type": "Cedro",
  "scientific_name": "Cedrela odorata",  // opcional
  "common_name": "Cedro-rosa",            // opcional
  "height_cm": 5,
  "width_cm": 15,
  "length_m": 3,
  "active": true   // padrão: true
}
```

> `unit_volume_m3` = `height_cm × width_cm × length_m / 10000`

| Status | Descrição |
|--------|-----------|
| 201 | Produto criado com volume calculado |

---

### GET /products/{id}
**Buscar produto por ID**

| Status | Descrição |
|--------|-----------|
| 200 | Produto encontrado |
| 404 | Não encontrado |

---

### PUT /products/{id}
**Atualizar produto** — Alterar dimensões recalcula `unit_volume_m3` (afeta cálculos em lotes existentes).

| Status | Descrição |
|--------|-----------|
| 200 | Atualizado |
| 404 | Não encontrado |

---

### DELETE /products/{id}
**Remover produto** — Só possível se não houver lotes/movimentações/desmembramentos vinculados. Prefira `active: false`.

| Status | Descrição |
|--------|-----------|
| 200 | Removido |
| 404 | Não encontrado |

---

## suppliers

### GET /suppliers
**Listar fornecedores**

| Status | Descrição |
|--------|-----------|
| 200 | Array de fornecedores |

---

### POST /suppliers
**Criar fornecedor** — CNPJ deve ser único.

```json
// Body
{
  "name": "Madeireira São Paulo Ltda",
  "cnpj": "12345678000199",         // 14 dígitos sem formatação
  "contact": "contato@madeireira.com.br"  // opcional
}
```

| Status | Descrição |
|--------|-----------|
| 201 | Fornecedor criado |
| 409 | CNPJ já cadastrado |

---

### GET /suppliers/{id}
**Buscar fornecedor por ID**

| Status | Descrição |
|--------|-----------|
| 200 | Encontrado |
| 404 | Não encontrado |

---

### PUT /suppliers/{id}
**Atualizar fornecedor**

| Status | Descrição |
|--------|-----------|
| 200 | Atualizado |
| 404 | Não encontrado |
| 409 | CNPJ já pertence a outro fornecedor |

---

### DELETE /suppliers/{id}
**Remover fornecedor** — Falha se houver lotes vinculados.

| Status | Descrição |
|--------|-----------|
| 200 | Removido |
| 404 | Não encontrado |

---

## lots

### GET /lots
**Listar lotes** — Ordenados por data de entrada (mais recentes primeiro). Inclui itens e fornecedor.

| Status | Descrição |
|--------|-----------|
| 200 | Array de lotes |

---

### POST /lots
**Registrar lote de entrada** — `dofNumber` deve ser único. Volume calculado automaticamente por item.

```json
// Body
{
  "dofNumber": "DOF-2026-00123",
  "supplierId": 1,
  "entryDate": "2026-05-07",
  "items": [
    { "productId": 1, "quantity": 10 },
    { "productId": 2, "quantity": 5 }
  ]
}
```

| Status | Descrição |
|--------|-----------|
| 201 | Lote criado com itens e volumes |
| 400 | Dados inválidos |
| 404 | Fornecedor ou produto não existe |
| 409 | Número de DOF já cadastrado |

---

### GET /lots/{id}
**Buscar lote por ID** — Inclui todos os itens, volumes e fornecedor.

| Status | Descrição |
|--------|-----------|
| 200 | Lote encontrado |
| 404 | Não encontrado |

---

### PUT /lots/{id}
**Atualizar lote** — Se `items` for enviado, **substitui completamente** os itens anteriores.

| Status | Descrição |
|--------|-----------|
| 200 | Atualizado |
| 400 | Lista de itens vazia ou dados inválidos |
| 404 | Lote, fornecedor ou produto não encontrado |
| 409 | Novo DOF ja pertence a outro lote |

---

### DELETE /lots/{id}
**Remover lote** — Remove lote e todos os itens. Reverte as entradas de estoque (pode gerar saldo negativo).

| Status | Descrição |
|--------|-----------|
| 200 | Removido |
| 404 | Não encontrado |

---

## stock

### GET /stock
**Estoque completo** — Calcula em tempo real: entradas − saídas − desmembramentos. Retorna:
- `products` — por produto (espécie + dimensão exata)
- `species` — consolidado por tipo de madeira
- `totalVolume_m3`, `totalQuantity`, `speciesCount`

| Status | Descrição |
|--------|-----------|
| 200 | Objeto com products, species e totais |

---

### GET /stock/products
**Estoque por produto** — Array com quantidade e volume por espécie/dimensão específica.

| Status | Descrição |
|--------|-----------|
| 200 | Array de produtos com `id`, `wood_type`, `common_name`, `quantity`, `volume_m3` |

---

### GET /stock/species
**Estoque por espécie** — Soma de todos os produtos do mesmo `wood_type`.

| Status | Descrição |
|--------|-----------|
| 200 | Array com `wood_type`, `totalQuantity`, `totalVolume_m3` |

---

### GET /stock/products/{id}
**Estoque de um produto específico** — Saldo atual com detalhamento de entradas e saídas.

| Status | Descrição |
|--------|-----------|
| 200 | Saldo com `quantity`, `volume_m3` e dados do produto |
| 404 | Produto não encontrado |

---

## movements

### GET /movements
**Listar movimentações** — Ordenadas por data (mais recentes primeiro). Inclui produto vinculado.

| Status | Descrição |
|--------|-----------|
| 200 | Array de movimentações |

---

### POST /movements
**Registrar movimentação**

Tipos:
- `saida` — saída normal (venda, transferência, perda). Debita do estoque.
- `ajuste` — correção manual de estoque.

```json
// Body
{
  "type": "saida",
  "productId": 1,
  "quantity": 5,
  "volume_m3": 0.0225,        // opcional — calculado automaticamente se omitido
  "date": "2026-05-07",       // opcional — padrão: data atual
  "observation": "Venda para cliente X"  // opcional
}
```

| Status | Descrição |
|--------|-----------|
| 201 | Movimentação registrada |
| 400 | Dados inválidos |

---

### GET /movements/{id}
**Buscar movimentação por ID**

| Status | Descrição |
|--------|-----------|
| 200 | Encontrada |
| 404 | Não encontrada |

---

### PUT /movements/{id}
**Atualizar movimentação** — Todos os campos opcionais. Útil para corrigir erros ou adicionar observações.

| Status | Descrição |
|--------|-----------|
| 200 | Atualizada |
| 404 | Não encontrada |

---

### DELETE /movements/{id}
**Remover movimentação** — Estorna o débito no estoque (restaura saldo do produto).

| Status | Descrição |
|--------|-----------|
| 200 | Removida |
| 404 | Não encontrada |

---

## dismemberments

### GET /dismemberments
**Listar desmembramentos** — Inclui produto de origem, itens produzidos e volumes.

| Status | Descrição |
|--------|-----------|
| 200 | Array de desmembramentos |

---

### POST /dismemberments
**Registrar desmembramento** — Produto de origem debitado, produtos destino creditados.

```json
// Body
{
  "originProductId": 1,
  "originQuantity": 1,
  "items": [
    { "destinationProductId": 2, "quantity": 4 }
  ],
  "date": "2026-05-07"   // opcional — padrão: data atual
}
```

> Exemplo: 1 tora (id=1) → 4 pranchas (id=2)

| Status | Descrição |
|--------|-----------|
| 201 | Desmembramento registrado |
| 400 | Dados inválidos |
| 404 | Produto de origem ou destino não encontrado |

---

### GET /dismemberments/{id}
**Buscar desmembramento por ID**

| Status | Descrição |
|--------|-----------|
| 200 | Encontrado |
| 404 | Não encontrado |

---

### DELETE /dismemberments/{id}
**Remover desmembramento** — Estorna todas as operações: produto de origem creditado, destinos debitados.

| Status | Descrição |
|--------|-----------|
| 200 | Removido e estoque estornado |
| 404 | Não encontrado |

---

## dof

### GET /dof
**Controle de DOFs** — Status de todos os DOFs ativos, classificados por situação:
- **Ativo** — dentro do prazo e com volume disponível
- **Em alerta** — próximo ao vencimento ou alto consumo
- **Irregular** — vencido ou volume consumido acima do autorizado

Retorna `summary` (contadores por status) e `dofs` (lista detalhada: número, fornecedor, volume autorizado, consumido, disponível, status).

| Status | Descrição |
|--------|-----------|
| 200 | Objeto com `summary` e `dofs` |

---

## dashboard

### GET /dashboard
**Dashboard principal** — Resumo consolidado da operação. Retorna:

```json
{
  "summary": {
    "totalStockVolume_m3": 0,
    "totalStockQuantity": 0,
    "activeDofs": 0,
    "speciesCount": 0,
    "productCount": 0,
    "dofAlerts": 0,
    "entriesCount": 0,
    "movementsCount": 0,
    "dismembermentsCount": 0
  },
  "dof": { /* mesmo conteúdo de GET /dof — apenas o summary */ },
  "latestActivity": [ /* 10 últimas atividades misturadas, ordem decrescente */ ]
}
```

| Status | Descrição |
|--------|-----------|
| 200 | Objeto com summary, dof e latestActivity |
