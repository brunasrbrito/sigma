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
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar perfis de acesso',
    description:
      'Retorna todos os perfis de acesso cadastrados. ' +
      'Um perfil agrupa usuários por nível de permissão (ex: "Admin", "Operador", "Visualizador"). ' +
      'Os perfis são criados manualmente e depois vinculados aos usuários.',
  })
  @ApiResponse({ status: 200, description: 'Array de perfis.' })
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar perfil por ID',
    description: 'Retorna os dados de um perfil de acesso específico.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do perfil' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar perfil',
    description:
      'Cria um novo perfil de acesso. ' +
      'O perfil é identificado apenas pelo nome — crie primeiro o perfil, ' +
      'depois vincule usuários a ele via `POST /users` ou `PUT /users/:id`.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Admin', description: 'Nome do perfil de acesso' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Perfil criado.' })
  create(@Body('name') name: string) {
    return this.profilesService.create(name);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Renomear perfil',
    description: 'Atualiza o nome de um perfil de acesso existente.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do perfil' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Supervisor' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.profilesService.update(id, name);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover perfil',
    description:
      'Remove permanentemente um perfil de acesso. ' +
      'Não é possível remover um perfil que possui usuários vinculados.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do perfil' })
  @ApiResponse({ status: 200, description: 'Perfil removido.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}
