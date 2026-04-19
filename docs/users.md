# Usuários do Sistema

> Mapeamento dos perfis de acesso do sigma com base no fluxo real da madeireira.

---

## Visão Geral

O sistema usa **Perfis dinâmicos** — o administrador cria os perfis no banco (tabela `profiles`). Os dois perfis esperados no MVP são `administrador` e `vendedor`, mas a estrutura é flexível.

O escopo é **controle de estoque** — não inclui módulo de vendas completo nem cadastro de clientes na versão inicial.

---

## Perfis

### Administrador

Único perfil com acesso de escrita. Na prática, é o dono/responsável pela operação.

| Funcionalidade | Acesso |
|---|---|
| Cadastro de espécies de madeira | Criar / Editar / Remover |
| Cadastro de fornecedores | Criar / Editar / Remover |
| Registro de entrada de estoque (compra) | Criar |
| Registro de saída de estoque (pedido atendido) | Criar |
| Desmembramento de itens | Criar |
| Ajuste manual de estoque | Criar |
| Visualização do estoque atual | Sim |
| Histórico de movimentações | Sim |
| Monitoramento de divergência DOF | Sim (com alertas) |
| Dashboard geral | Sim |
| Exportação de relatórios (Excel) | Sim |
| Gestão de usuários | Sim |

**Responsabilidade fora do sistema:**
Sincronizar os valores com o sistema do IBAMA (DOF) — essa atualização é feita manualmente em paralelo por outra pessoa.

---

### Vendedor

Perfil somente leitura. Consulta disponibilidade antes de atender um cliente.

| Funcionalidade | Acesso |
|---|---|
| Visualização do estoque atual (quantidade por espécie) | Sim |
| Histórico de movimentações | Não |
| Divergência DOF | Não |
| Dashboard | Não |
| Qualquer ação de escrita | Não |

---

## Contexto: O que é o DOF

O **DOF (Documento de Origem Florestal)** é um documento do IBAMA que registra o volume de madeira em m³ autorizado para movimentação. A empresa precisa manter o estoque interno com **no máximo 10% de variação** em relação ao volume registrado no DOF.

Ultrapassar esse limite expõe a empresa a:
- Fiscalizações ambientais
- Multas
- Processos legais

O controle de estoque, portanto, **é um requisito legal**, não apenas operacional.

O sistema deve **calcular e exibir a divergência** entre estoque físico e DOF para que o Administrador possa fazer os ajustes necessários.

---

## Funcionalidade: Desmembramento de Itens

O Administrador pode transformar um item em múltiplos itens menores, mantendo o volume total em m³ igual.

**Exemplo:**
- 1 viga 15x15x450cm → 3 caibros 5x5x450cm
- Volume original: 0,0338 m³ = Volume resultante: 3 × 0,0113 m³

Essa operação é registrada como movimentação e impacta o estoque.

---

## Fora do Escopo (decisão do grupo)

- Módulo completo de vendas
- Cadastro de clientes
- Emissão de notas ou pedidos
- Integração direta com o sistema do IBAMA
