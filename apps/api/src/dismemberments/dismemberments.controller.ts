import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DismembermentsService } from './dismemberments.service';

@ApiTags('dismemberments')
@Controller('dismemberments')
export class DismembermentsController {
  constructor(private dismembermentsService: DismembermentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar desmembramentos',
    description:
      'Retorna todos os desmembramentos registrados. ' +
      'Um desmembramento representa a transformação de um produto em outros — ' +
      'por exemplo, uma tora serrada em pranchas. ' +
      'A resposta inclui o produto de origem, os itens produzidos e os volumes envolvidos.',
  })
  @ApiResponse({ status: 200, description: 'Array de desmembramentos com produto de origem e itens produzidos.' })
  findAll() {
    return this.dismembermentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar desmembramento por ID',
    description: 'Retorna os dados completos de um desmembramento específico.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do desmembramento' })
  @ApiResponse({ status: 200, description: 'Desmembramento encontrado.' })
  @ApiResponse({ status: 404, description: 'Desmembramento não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dismembermentsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar desmembramento',
    description:
      'Registra a transformação de um produto de origem em um ou mais produtos destino.\n\n' +
      '**Como funciona:**\n\n' +
      '1. O `originProductId` é debitado em `originQuantity` unidades no estoque.\n' +
      '2. Para cada item em `items`, o `destinationProductId` é creditado em `quantity` unidades.\n\n' +
      'Exemplo: uma tora (id=1) de 1 peça vira 4 pranchas (id=2) → ' +
      '`originProductId: 1, originQuantity: 1, items: [{ destinationProductId: 2, quantity: 4 }]`\n\n' +
      'Os volumes são calculados automaticamente com base no `unit_volume_m3` de cada produto. ' +
      '`date` é opcional e assume a data atual se omitido.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['originProductId', 'originQuantity', 'items'],
      properties: {
        originProductId: {
          type: 'number',
          example: 1,
          description: 'Produto que será debitado (produto de origem)',
        },
        originQuantity: {
          type: 'integer',
          example: 1,
          description: 'Quantidade de peças do produto de origem consumidas',
        },
        items: {
          type: 'array',
          minItems: 1,
          description: 'Produtos gerados pelo desmembramento',
          items: {
            type: 'object',
            required: ['destinationProductId', 'quantity'],
            properties: {
              destinationProductId: {
                type: 'number',
                example: 2,
                description: 'Produto que será creditado (produto destino)',
              },
              quantity: {
                type: 'integer',
                example: 4,
                description: 'Quantidade de peças geradas do produto destino',
              },
            },
          },
        },
        date: {
          type: 'string',
          example: '2026-05-07',
          nullable: true,
          description: 'Data do desmembramento (YYYY-MM-DD). Padrão: data atual.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Desmembramento registrado com débito e créditos no estoque.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (lista de itens vazia, quantidade zero, etc.).' })
  @ApiResponse({ status: 404, description: 'Produto de origem ou destino não encontrado.' })
  create(
    @Body()
    body: {
      originProductId: number;
      originQuantity: number;
      items: Array<{ destinationProductId: number; quantity: number }>;
      date?: string;
    },
  ) {
    return this.dismembermentsService.create(body, undefined);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover desmembramento',
    description:
      'Remove permanentemente um desmembramento. ' +
      'A remoção estorna todas as operações: ' +
      'o produto de origem é creditado de volta e os produtos destino são debitados.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do desmembramento' })
  @ApiResponse({ status: 200, description: 'Desmembramento removido e estoque estornado.' })
  @ApiResponse({ status: 404, description: 'Desmembramento não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dismembermentsService.remove(id);
  }
}
