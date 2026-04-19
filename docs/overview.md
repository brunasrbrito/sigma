# Visão Geral do Sistema

> Sigma — Sistema de controle de estoque para madeireiras. Projeto acadêmico UNIVESP.

---

## O que o sistema resolve

Madeireiras trabalham com **madeiras de lei**, sujeitas a rastreabilidade obrigatória pelo IBAMA via **DOF (Documento de Origem Florestal)**. Hoje o controle é feito manualmente em planilha Excel, com os seguintes problemas:

- Lançamentos duplicados (planilha interna + sistema do IBAMA)
- Dependência de uma única pessoa para manter o controle
- Alto risco de inconsistência entre estoque físico e DOF
- Baixa rastreabilidade das movimentações

O sistema centraliza esse controle e alerta quando o estoque físico ultrapassa a tolerância legal de **10%** em relação ao DOF.

---

## Escopo do MVP

| Incluído | Fora do escopo |
|---|---|
| Cadastro de espécies e tipos de madeira | Módulo de vendas completo |
| Controle de estoque em m³ | Emissão de notas fiscais |
| Registro de entradas (compra + DOF) | Integração direta com sistema IBAMA |
| Registro de saídas (pedidos atendidos) | Cadastro completo de clientes |
| Desmembramento de peças | |
| Monitoramento de divergência DOF (alerta 10%) | |
| Dashboard básico | |
| Exportação de relatório (Excel) | |
| Multi-usuário | |

---

## Fluxo Principal

```
COMPRA:
  Fornecedor → Entrada no estoque (m³) + Número DOF registrado

SAÍDA:
  Pedido atendido → Saída do estoque (m³) → Divergência DOF recalculada

DESMEMBRAMENTO:
  1 viga 15x15cm → 3 caibros 5x5cm (volume m³ preservado)

MONITORAMENTO:
  Estoque físico (m³) vs Volume DOF → Diferença % → Alerta se > 10%
```

---

## Regra de Negócio Principal: Tolerância DOF

O IBAMA exige que o estoque físico de madeira não difira mais de **10%** do volume registrado no DOF.

```
Volume DOF Corrigido = Total DOF × 1,10   (limite superior)
Diferença de Saldo   = Total Cubagem − Total DOF
Valor Ajuste         = quanto remover/ajustar para entrar na margem
```

Se a diferença ultrapassar 10%, a empresa está sujeita a:
- Fiscalização ambiental
- Multas
- Processos legais

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (porta 3001) |
| Backend | NestJS (porta 3000) |
| Banco de dados | MySQL (TypeORM) |
| Monorepo | pnpm workspaces |
| Auth | JWT (access 15m + refresh 7d, cookies) |
| E-mail | Resend (reset de senha) |

---

## Status do MVP (2026-04-19)

| Módulo | Status |
|---|---|
| Auth (login, logout, refresh, reset senha) | Entregue |
| CRUD de Usuários | Entregue |
| CRUD de Perfis | Entregue |
| CRUD de Produtos (Madeiras) | Entregue |
| Dashboard (stub protegido) | Entregue |
| Controle de Estoque (Lotes, Movimentações) | Planejado |
| DOF / Divergência | Planejado |
| Fornecedores | Planejado |
| Relatórios / Exportação | Planejado |
