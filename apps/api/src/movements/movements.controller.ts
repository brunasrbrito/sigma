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
import { MovementsService } from './movements.service';

@ApiTags('movements')
@Controller('movements')
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar movimentações',
    description:
      'Retorna todas as movimentações registradas, ordenadas por data (mais recentes primeiro). ' +
      'Uma movimentação registra qualquer saída ou correção de estoque. ' +
      'A resposta inclui os dados do produto movimentado.',
  })
  @ApiResponse({ status: 200, description: 'Array de movimentações com produto vinculado.' })
  findAll() {
    return this.movementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar movimentação por ID',
    description: 'Retorna os dados completos de uma movimentação específica.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico da movimentação' })
  @ApiResponse({ status: 200, description: 'Movimentação encontrada.' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar movimentação',
    description:
      'Registra uma saída ou ajuste de estoque para um produto.\n\n' +
      '**Tipos disponíveis:**\n\n' +
      '- `saida`: saída normal de mercadoria (venda, transferência, perda). ' +
      'Debita a `quantity` informada do estoque do produto.\n' +
      '- `ajuste`: correção manual do estoque (inventário, acerto de diferença). ' +
      'Pode representar débito ou crédito dependendo do contexto.\n\n' +
      'O campo `volume_m3` é opcional — se não informado, é calculado automaticamente ' +
      'com base no `unit_volume_m3` do produto × `quantity`. ' +
      '`date` também é opcional e assume a data atual se omitido.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'productId', 'quantity'],
      properties: {
        type: {
          type: 'string',
          enum: ['saida', 'ajuste'],
          example: 'saida',
          description: '"saida" para saída de estoque, "ajuste" para correção manual',
        },
        productId: { type: 'number', example: 1 },
        quantity: { type: 'integer', example: 5, description: 'Número de peças movimentadas' },
        volume_m3: {
          type: 'number',
          example: 0.0225,
          nullable: true,
          description: 'Volume em m³. Se omitido, calculado automaticamente.',
        },
        date: {
          type: 'string',
          example: '2026-05-07',
          nullable: true,
          description: 'Data da movimentação (YYYY-MM-DD). Padrão: data atual.',
        },
        observation: {
          type: 'string',
          example: 'Venda para cliente X',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Movimentação registrada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (produto não encontrado, quantidade zero, etc.).' })
  create(
    @Body()
    body: {
      type: 'saida' | 'ajuste';
      productId: number;
      quantity: number;
      volume_m3?: number;
      date?: string;
      observation?: string | null;
    },
  ) {
    return this.movementsService.create(body, undefined);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar movimentação',
    description:
      'Atualiza os dados de uma movimentação existente. Todos os campos são opcionais. ' +
      'Útil para corrigir erros de digitação ou adicionar observações.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico da movimentação' })
  @ApiResponse({ status: 200, description: 'Movimentação atualizada.' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      type?: 'saida' | 'ajuste';
      productId?: number;
      quantity?: number;
      volume_m3?: number;
      date?: string;
      observation?: string | null;
    },
  ) {
    return this.movementsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover movimentação',
    description:
      'Remove permanentemente uma movimentação. ' +
      'A remoção estorna o débito no estoque — o saldo do produto é restaurado.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico da movimentação' })
  @ApiResponse({ status: 200, description: 'Movimentação removida.' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.remove(id);
  }
}
