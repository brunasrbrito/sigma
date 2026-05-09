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
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar fornecedores',
    description:
      'Retorna todos os fornecedores cadastrados. ' +
      'Fornecedores são as empresas ou produtores rurais que emitem os lotes de madeira com DOF. ' +
      'O CNPJ é único por fornecedor.',
  })
  @ApiResponse({ status: 200, description: 'Array com todos os fornecedores.' })
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar fornecedor por ID',
    description: 'Retorna os dados de um fornecedor específico pelo seu ID numérico.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor encontrado.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar fornecedor',
    description:
      'Cadastra um novo fornecedor. O CNPJ deve ser único no sistema. ' +
      'O campo `contact` é opcional e pode conter e-mail, telefone ou qualquer texto de contato. ' +
      'Para criar um lote de entrada, o fornecedor precisa estar cadastrado previamente.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'cnpj'],
      properties: {
        name: { type: 'string', example: 'Madeireira São Paulo Ltda' },
        cnpj: { type: 'string', example: '12345678000199', description: 'CNPJ sem formatação (14 dígitos)' },
        contact: { type: 'string', example: 'contato@madeireira.com.br', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fornecedor criado.' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado.' })
  create(
    @Body()
    body: { name: string; cnpj: string; contact?: string | null },
  ) {
    return this.suppliersService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar fornecedor',
    description:
      'Atualiza os dados de um fornecedor existente. Todos os campos são opcionais. ' +
      'Caso `cnpj` seja alterado, o novo valor deve ser único no sistema.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor atualizado.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  @ApiResponse({ status: 409, description: 'CNPJ já pertence a outro fornecedor.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { name?: string; cnpj?: string; contact?: string | null },
  ) {
    return this.suppliersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover fornecedor',
    description:
      'Remove permanentemente um fornecedor. ' +
      'Não é possível remover fornecedores que possuem lotes vinculados.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor removido.' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
