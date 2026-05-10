# Prompt — Seed de Dados para Validação

> Você é um agente de execução. Cadastre todos os dados abaixo em ordem, usando `curl` diretamente no backend (porta 3000).
> Capture o `id` retornado em cada resposta e use-o nos passos seguintes.
> Ao final, retorne o JSON de resultado conforme especificado.

---

## Pré-requisito

O backend deve estar rodando em `http://localhost:3000`.

Verifique antes de começar:

```bash
curl -s http://localhost:3000/api/products | python -m json.tool | head -5
```

Se retornar erro de conexão, pare e informe. Se retornar `[]` ou uma lista, continue.

---

## Passo 1 — Produtos (5 espécies de madeira)

Execute cada comando e anote o `id` retornado.

**Produto 1 — Cedro Tábua**
```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"wood_type":"Cedro","scientific_name":"Cedrela odorata","common_name":"Cedro-rosa","height_cm":5,"width_cm":15,"length_m":3}' \
  | python -m json.tool
```

**Produto 2 — Ipê Caibro**
```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"wood_type":"Ipê","scientific_name":"Handroanthus impetiginosus","common_name":"Ipê-roxo","height_cm":5,"width_cm":10,"length_m":3}' \
  | python -m json.tool
```

**Produto 3 — Mogno Prancha**
```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"wood_type":"Mogno","scientific_name":"Swietenia macrophylla","common_name":"Mogno-brasileiro","height_cm":3,"width_cm":20,"length_m":4}' \
  | python -m json.tool
```

**Produto 4 — Peroba Viga**
```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"wood_type":"Peroba","scientific_name":"Aspidosperma polyneuron","common_name":"Peroba-rosa","height_cm":8,"width_cm":20,"length_m":6}' \
  | python -m json.tool
```

**Produto 5 — Teca Régua**
```bash
curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"wood_type":"Teca","scientific_name":"Tectona grandis","common_name":"Teca","height_cm":2,"width_cm":10,"length_m":3}' \
  | python -m json.tool
```

> Anote os IDs retornados. Exemplo esperado: Produto 1 = id 1, Produto 2 = id 2, etc.
> Se os produtos já existirem (banco não estava vazio), use `GET /api/products` para listar os IDs reais.

---

## Passo 2 — Fornecedores (2 fornecedores)

**Fornecedor 1 — Madeireira Norte**
```bash
curl -s -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name":"Madeireira Norte Ltda","cnpj":"11222333000181","contact":"contato@madeireiran.com.br"}' \
  | python -m json.tool
```

**Fornecedor 2 — Florestal Sul**
```bash
curl -s -X POST http://localhost:3000/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name":"Florestal Sul S.A.","cnpj":"44555666000172","contact":"vendas@florestalsul.com.br"}' \
  | python -m json.tool
```

> Anote os IDs retornados. Exemplo esperado: Fornecedor 1 = id 1, Fornecedor 2 = id 2.

---

## Passo 3 — Lotes de Entrada (2 lotes com DOF)

Use os IDs reais dos produtos e fornecedores criados acima.

**Lote 1 — DOF março (Fornecedor 1, Cedro + Ipê)**
```bash
curl -s -X POST http://localhost:3000/api/lots \
  -H "Content-Type: application/json" \
  -d '{
    "dofNumber": "DOF-2026-00101",
    "supplierId": 1,
    "entryDate": "2026-03-15",
    "items": [
      {"productId": 1, "quantity": 80},
      {"productId": 2, "quantity": 50}
    ]
  }' | python -m json.tool
```

**Lote 2 — DOF abril (Fornecedor 2, Mogno + Peroba + Teca)**
```bash
curl -s -X POST http://localhost:3000/api/lots \
  -H "Content-Type: application/json" \
  -d '{
    "dofNumber": "DOF-2026-00202",
    "supplierId": 2,
    "entryDate": "2026-04-10",
    "items": [
      {"productId": 3, "quantity": 30},
      {"productId": 4, "quantity": 20},
      {"productId": 5, "quantity": 60}
    ]
  }' | python -m json.tool
```

> Os lotes debitam dos DOFs e creditam no estoque automaticamente.

---

## Passo 4 — Movimentações (3 saídas e 1 ajuste)

**Movimentação 1 — Saída de Cedro (venda)**
```bash
curl -s -X POST http://localhost:3000/api/movements \
  -H "Content-Type: application/json" \
  -d '{"type":"saida","productId":1,"quantity":15,"date":"2026-04-20","observation":"Venda para Construtora ABC"}' \
  | python -m json.tool
```

**Movimentação 2 — Saída de Ipê (venda)**
```bash
curl -s -X POST http://localhost:3000/api/movements \
  -H "Content-Type: application/json" \
  -d '{"type":"saida","productId":2,"quantity":10,"date":"2026-04-25","observation":"Venda para Marcenaria XYZ"}' \
  | python -m json.tool
```

**Movimentação 3 — Saída de Teca (venda)**
```bash
curl -s -X POST http://localhost:3000/api/movements \
  -H "Content-Type: application/json" \
  -d '{"type":"saida","productId":5,"quantity":12,"date":"2026-05-03","observation":"Venda para Carpintaria Sul"}' \
  | python -m json.tool
```

**Movimentação 4 — Ajuste de Mogno (correção de inventário)**
```bash
curl -s -X POST http://localhost:3000/api/movements \
  -H "Content-Type: application/json" \
  -d '{"type":"ajuste","productId":3,"quantity":2,"date":"2026-05-05","observation":"Correção de inventário — peças com defeito descartadas"}' \
  | python -m json.tool
```

---

## Passo 5 — Desmembramento (1 viga Peroba → réguas Teca)

> Transforma 1 viga de Peroba em 5 réguas de Teca.
> A Peroba deve ter estoque disponível (criada no Lote 2 com 20 unidades).

```bash
curl -s -X POST http://localhost:3000/api/dismemberments \
  -H "Content-Type: application/json" \
  -d '{
    "originProductId": 4,
    "originQuantity": 2,
    "date": "2026-05-07",
    "items": [
      {"destinationProductId": 5, "quantity": 10}
    ]
  }' | python -m json.tool
```

---

## Passo 6 — Verificação final

Confirme que os dados estão presentes:

```bash
echo "=== PRODUTOS ===" && curl -s http://localhost:3000/api/products | python -m json.tool | grep '"id"\|"wood_type"\|"common_name"'
echo "=== FORNECEDORES ===" && curl -s http://localhost:3000/api/suppliers | python -m json.tool | grep '"id"\|"name"'
echo "=== ESTOQUE ===" && curl -s http://localhost:3000/api/stock | python -m json.tool | grep '"totalQuantity"\|"totalVolume_m3"\|"speciesCount"'
echo "=== LOTES ===" && curl -s http://localhost:3000/api/lots | python -m json.tool | grep '"id"\|"dofNumber"'
echo "=== MOVIMENTAÇÕES ===" && curl -s http://localhost:3000/api/movements | python -m json.tool | grep '"id"\|"type"\|"quantity"'
echo "=== DOF ===" && curl -s http://localhost:3000/api/dof | python -m json.tool | grep '"status"\|"speciesCount"\|"conformingCount"'
echo "=== DESMEMBRAMENTOS ===" && curl -s http://localhost:3000/api/dismemberments | python -m json.tool | grep '"id"\|"originProductId"'
echo "=== DASHBOARD ===" && curl -s http://localhost:3000/api/dashboard | python -m json.tool | grep '"totalStockVolume_m3"\|"activeDofs"\|"speciesCount"'
```

---

## Resultado esperado — JSON de saída

```json
{
  "seed": "dados-validacao",
  "status": "<ok | parcial | falhou>",
  "criados": {
    "produtos": 5,
    "fornecedores": 2,
    "lotes": 2,
    "movimentacoes": 4,
    "desmembramentos": 1
  },
  "ids_criados": {
    "produtos": [],
    "fornecedores": [],
    "lotes": [],
    "movimentacoes": [],
    "desmembramentos": []
  },
  "verificacao_final": {
    "estoque_total_volume_m3": null,
    "estoque_total_qtde": null,
    "species_count": null,
    "dofs_ativos": null,
    "dashboard_ok": "<true | false>"
  },
  "erros": [],
  "observacoes": ""
}
```

> Se algum item já existir (erro 409 ou 400), anote em `erros` e continue com os demais.
> Ajuste os `supplierId` e `productId` nos comandos caso os IDs reais sejam diferentes dos exemplos.
