import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LotsService } from './lots.service';

@ApiTags('lots')
@Controller('lots')
export class LotsController {
  constructor(private lotsService: LotsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar lotes',
    description:
      'Retorna todos os lotes de entrada cadastrados, ordenados por data de entrada (mais recentes primeiro). ' +
      'Cada lote representa uma carga de madeira que entrou no estoque com um número de DOF associado. ' +
      'A resposta inclui os itens do lote (produtos e volumes) e os dados do fornecedor.',
  })
  @ApiResponse({ status: 200, description: 'Array de lotes com itens e fornecedor.' })
  findAll() {
    return this.lotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar lote por ID',
    description:
      'Retorna um lote específico com todos os seus itens, volumes calculados e fornecedor vinculado.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do lote' })
  @ApiResponse({ status: 200, description: 'Lote encontrado com itens.' })
  @ApiResponse({ status: 404, description: 'Lote não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lotsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar lote de entrada',
    description:
      'Registra uma nova carga de madeira que entrou no estoque. ' +
      'O `dofNumber` é o número do Documento de Origem Florestal — deve ser único no sistema. ' +
      '`supplierId` deve referenciar um fornecedor já cadastrado. ' +
      '`entryDate` é a data de entrada física no estoque (formato `YYYY-MM-DD`). ' +
      '`items` define quais produtos (espécies/dimensões) entraram e em quais quantidades. ' +
      'O volume (`volume_m3`) de cada item é calculado automaticamente com base no `unit_volume_m3` do produto. ' +
      'Um lote precisa ter ao menos um item.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['dofNumber', 'supplierId', 'entryDate', 'items'],
      properties: {
        dofNumber: { type: 'string', example: 'DOF-2026-00123', description: 'Número único do DOF' },
        supplierId: { type: 'number', example: 1 },
        entryDate: { type: 'string', example: '2026-05-07', description: 'Data de entrada (YYYY-MM-DD)' },
        items: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['productId', 'quantity'],
            properties: {
              productId: { type: 'number', example: 1 },
              quantity: { type: 'integer', example: 10, description: 'Quantidade de peças' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Lote criado com itens e volumes calculados.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (sem itens, campos obrigatórios ausentes, etc.).' })
  @ApiResponse({ status: 404, description: 'Fornecedor ou produto referenciado não existe.' })
  @ApiResponse({ status: 409, description: 'Número de DOF já cadastrado.' })
  create(
    @Body()
    body: {
      dofNumber: string;
      supplierId: number;
      entryDate: string;
      items: Array<{ productId: number; quantity: number }>;
    },
  ) {
    return this.lotsService.create(body, undefined);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar lote',
    description:
      'Atualiza os dados de um lote existente. Todos os campos são opcionais. ' +
      'Se `items` for enviado, ele **substitui completamente** os itens anteriores — ' +
      'não é uma operação de adição. A lista nova deve ter ao menos um item. ' +
      'Os volumes são recalculados para os novos itens.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do lote' })
  @ApiResponse({ status: 200, description: 'Lote atualizado.' })
  @ApiResponse({ status: 400, description: 'Lista de itens vazia ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Lote, fornecedor ou produto não encontrado.' })
  @ApiResponse({ status: 409, description: 'Novo número de DOF já pertence a outro lote.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      dofNumber?: string;
      supplierId?: number;
      entryDate?: string;
      items?: Array<{ productId: number; quantity: number }>;
    },
  ) {
    return this.lotsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover lote',
    description:
      'Remove permanentemente um lote e todos os seus itens. ' +
      'Atenção: a remoção do lote reverte as entradas de estoque correspondentes — ' +
      'isso pode tornar o saldo negativo se houver saídas registradas com base neste lote.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do lote' })
  @ApiResponse({ status: 200, description: 'Lote removido.' })
  @ApiResponse({ status: 404, description: 'Lote não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lotsService.remove(id);
  }
}
