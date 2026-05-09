import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockService } from './stock.service';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get()
  @ApiOperation({
    summary: 'Estoque completo',
    description:
      'Retorna o saldo atual de todo o estoque. ' +
      'O cálculo é feito em tempo real somando todas as **entradas** (lotes) ' +
      'e subtraindo todas as **saídas** (movimentações do tipo `saida`) e os ' +
      '**desmembramentos** (que debitam do produto de origem). ' +
      'O resultado é agrupado de duas formas:\n\n' +
      '- **`products`**: nível de detalhe máximo, por produto (espécie + dimensão exata)\n' +
      '- **`species`**: visão consolidada por tipo de madeira (wood_type), somando todas as dimensões\n\n' +
      'Também retorna `totalVolume_m3`, `totalQuantity` e `speciesCount` como resumo geral.',
  })
  @ApiResponse({
    status: 200,
    description: 'Objeto com `products`, `species`, `totalVolume_m3`, `totalQuantity` e `speciesCount`.',
  })
  getCurrentStock() {
    return this.stockService.getCurrentStock();
  }

  @Get('products')
  @ApiOperation({
    summary: 'Estoque por produto',
    description:
      'Retorna apenas o array `products` do estoque atual. ' +
      'Cada item representa uma espécie/dimensão específica com sua quantidade e volume em estoque. ' +
      'Use este endpoint quando precisar saber exatamente quantas peças de cada tamanho existem.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array de produtos com `id`, `wood_type`, `common_name`, `quantity` e `volume_m3`.',
  })
  async getProducts() {
    const stock = await this.stockService.getCurrentStock();
    return stock.products;
  }

  @Get('species')
  @ApiOperation({
    summary: 'Estoque por espécie',
    description:
      'Retorna o estoque consolidado por espécie de madeira (`wood_type`), ' +
      'somando quantidade e volume de todos os produtos com o mesmo tipo. ' +
      'Útil para a visão gerencial — ex: "quantos m³ de Cedro temos no total, independente da dimensão".',
  })
  @ApiResponse({
    status: 200,
    description: 'Array de espécies com `wood_type`, `totalQuantity` e `totalVolume_m3`.',
  })
  async getSpecies() {
    const stock = await this.stockService.getCurrentStock();
    return stock.species;
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Estoque de um produto',
    description:
      'Retorna o saldo atual de um produto específico: ' +
      'quantidade em estoque, volume total e detalhamento de entradas e saídas. ' +
      'Use para verificar o saldo antes de registrar uma saída ou desmembramento.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do produto' })
  @ApiResponse({
    status: 200,
    description: 'Saldo do produto com `quantity`, `volume_m3` e dados do produto.',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.getProductStock(id);
  }
}
