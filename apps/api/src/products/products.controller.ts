import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar produtos',
    description:
      'Retorna todos os produtos cadastrados no sistema. ' +
      'Cada produto representa uma espécie/dimensão de madeira que pode ser estocada. ' +
      'O volume unitário (`unit_volume_m3`) é calculado automaticamente a partir das dimensões ' +
      '(`height_cm × width_cm × length_m / 10000`).',
  })
  @ApiResponse({ status: 200, description: 'Array com todos os produtos.' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description:
      'Retorna os dados completos de um produto específico, incluindo dimensões e volume unitário. ' +
      'Útil para validar antes de criar um lote ou movimentação.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar produto',
    description:
      'Cadastra uma nova espécie/dimensão de madeira. ' +
      'O campo `wood_type` é o identificador principal (ex: "Cedro", "Ipê", "Tora"). ' +
      '`scientific_name` e `common_name` são opcionais mas recomendados para rastreabilidade. ' +
      'As dimensões (`height_cm`, `width_cm`, `length_m`) definem o produto e são usadas para ' +
      'calcular automaticamente o `unit_volume_m3`, que por sua vez compõe o volume total nos lotes. ' +
      '`active: false` oculta o produto de novas entradas sem excluí-lo do histórico.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['wood_type', 'height_cm', 'width_cm', 'length_m'],
      properties: {
        wood_type: { type: 'string', example: 'Cedro' },
        scientific_name: { type: 'string', example: 'Cedrela odorata', nullable: true },
        common_name: { type: 'string', example: 'Cedro-rosa', nullable: true },
        height_cm: { type: 'number', example: 5, description: 'Espessura em centímetros' },
        width_cm: { type: 'number', example: 15, description: 'Largura em centímetros' },
        length_m: { type: 'number', example: 3, description: 'Comprimento em metros' },
        active: { type: 'boolean', example: true, default: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Produto criado com volume unitário calculado.' })
  create(
    @Body()
    body: {
      wood_type: string;
      scientific_name?: string;
      common_name?: string;
      height_cm: number;
      width_cm: number;
      length_m: number;
      active?: boolean;
    },
  ) {
    return this.productsService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar produto',
    description:
      'Atualiza os dados de um produto existente. Todos os campos são opcionais — ' +
      'envie apenas os que deseja alterar. ' +
      'Se as dimensões forem alteradas, o `unit_volume_m3` é recalculado. ' +
      'Atenção: alterar dimensões afeta o cálculo de volume em lotes já existentes.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      wood_type?: string;
      scientific_name?: string;
      common_name?: string;
      height_cm?: number;
      width_cm?: number;
      length_m?: number;
      active?: boolean;
    },
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover produto',
    description:
      'Remove permanentemente um produto do sistema. ' +
      'Só é possível remover produtos que não possuem lotes, movimentações ou desmembramentos vinculados. ' +
      'Para desativar sem excluir, prefira `PUT /products/:id` com `{ "active": false }`.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
