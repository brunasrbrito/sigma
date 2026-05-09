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
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Retorna todos os usuários cadastrados no sistema. ' +
      'O campo `passwordHash` não é retornado por segurança.',
  })
  @ApiResponse({ status: 200, description: 'Array de usuários com perfil vinculado.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico, incluindo o perfil de acesso vinculado.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description:
      'Cadastra um novo usuário no sistema. ' +
      'O `email` deve ser único. A `password` é armazenada como hash (bcrypt) — ' +
      'nunca em texto plano. ' +
      '`profileId` vincula o usuário a um perfil de acesso já cadastrado. ' +
      '`active: false` desativa o usuário sem excluí-lo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@sigma.com' },
        password: { type: 'string', example: 'Senha123!', description: 'Será armazenada como hash' },
        profileId: { type: 'number', example: 1, nullable: true, description: 'ID do perfil de acesso' },
        active: { type: 'boolean', example: true, default: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuário criado.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      profileId?: number;
      active?: boolean;
    },
  ) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza os dados cadastrais de um usuário. Todos os campos são opcionais. ' +
      'Para alterar a senha, use `PUT /users/:id/reset-password`.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      email?: string;
      profileId?: number;
      active?: boolean;
    },
  ) {
    return this.usersService.update(id, body);
  }

  @Put(':id/reset-password')
  @ApiOperation({
    summary: 'Redefinir senha do usuário',
    description:
      'Redefine a senha de um usuário diretamente (operação administrativa). ' +
      'A nova senha é armazenada como hash bcrypt. ' +
      'Diferente do fluxo de esqueci minha senha (`POST /auth/forgot-password`), ' +
      'este endpoint não exige token de confirmação.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['newPassword'],
      properties: {
        newPassword: { type: 'string', example: 'NovaSenha456!', description: 'Nova senha em texto plano' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description:
      'Remove permanentemente um usuário. ' +
      'Para desativar sem excluir, prefira `PUT /users/:id` com `{ "active": false }`.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
