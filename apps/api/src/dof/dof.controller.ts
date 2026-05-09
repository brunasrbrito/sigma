import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DofService } from './dof.service';

@ApiTags('dof')
@Controller('dof')
export class DofController {
  constructor(private dofService: DofService) {}

  @Get()
  @ApiOperation({
    summary: 'Controle de DOFs',
    description:
      'Retorna o status de todos os DOFs (Documentos de Origem Florestal) ativos no sistema, ' +
      'classificados por situação de validade.\n\n' +
      '**Cada DOF é classificado em uma das três categorias:**\n\n' +
      '- **Ativo**: DOF dentro do prazo e com volume disponível\n' +
      '- **Em alerta**: DOF próximo ao vencimento ou com alto consumo do volume autorizado\n' +
      '- **Irregular**: DOF vencido ou com volume consumido acima do autorizado\n\n' +
      'A resposta inclui um `summary` com os contadores por categoria e uma lista `dofs` ' +
      'com o detalhamento de cada DOF: número, fornecedor, volume autorizado, ' +
      'volume consumido, volume disponível e status calculado.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Objeto com `summary` (totais por status) e `dofs` (lista detalhada de cada DOF com status calculado).',
  })
  getControl() {
    return this.dofService.getControl();
  }
}
