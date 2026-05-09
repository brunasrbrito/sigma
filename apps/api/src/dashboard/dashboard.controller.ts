import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Dashboard principal',
    description:
      'Retorna um resumo consolidado de toda a operação do sistema, ideal para a tela inicial.\n\n' +
      '**O objeto de resposta contém:**\n\n' +
      '- **`summary`**: indicadores gerais\n' +
      '  - `totalStockVolume_m3`: volume total em estoque (m³)\n' +
      '  - `totalStockQuantity`: quantidade total de peças em estoque\n' +
      '  - `activeDofs`: número de DOFs ativos\n' +
      '  - `speciesCount`: número de espécies distintas em estoque\n' +
      '  - `productCount`: total de produtos cadastrados\n' +
      '  - `dofAlerts`: total de DOFs em alerta ou irregular (requer atenção)\n' +
      '  - `entriesCount`: total de lotes de entrada registrados\n' +
      '  - `movementsCount`: total de movimentações registradas\n' +
      '  - `dismembermentsCount`: total de desmembramentos registrados\n\n' +
      '- **`dof`**: resumo do controle de DOFs (mesmos dados de `GET /dof`, porém apenas o summary)\n\n' +
      '- **`latestActivity`**: lista com as 10 últimas atividades do sistema ' +
      '(entradas, saídas e desmembramentos misturados, ordenados por data decrescente)',
  })
  @ApiResponse({
    status: 200,
    description: 'Objeto com `summary`, `dof` e `latestActivity`.',
  })
  getDashboard() {
    return this.dashboardService.getDashboard(null);
  }
}
