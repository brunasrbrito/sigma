import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
    description:
      'Autentica o usuário com e-mail e senha. ' +
      'Em caso de sucesso, define dois cookies HTTP-only no navegador: ' +
      '`access_token` (JWT de curta duração, 15 min) e `refresh_token` (JWT de longa duração, 7 dias). ' +
      'Esses cookies são enviados automaticamente pelo navegador nas requisições subsequentes.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'admin@sigma.com' },
        password: { type: 'string', example: 'Senha123!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Cookies `access_token` e `refresh_token` são definidos.',
  })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos.' })
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { user: result.user };
  }

  @ApiOperation({
    summary: 'Renovar access_token',
    description:
      'Gera um novo `access_token` a partir de um `refresh_token` válido. ' +
      'Use este endpoint quando o `access_token` expirar (após 15 min). ' +
      'O `refresh_token` deve ser enviado no corpo da requisição. ' +
      'Retorna apenas o novo `access_token` como string — atualize o cookie manualmente se necessário.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: { type: 'string', description: 'JWT de refresh obtido no login' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Novo `access_token` retornado.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não enviado');
    }
    return this.authService.refresh(refreshToken);
  }

  @ApiOperation({
    summary: 'Logout',
    description:
      'Encerra a sessão do usuário limpando os cookies `access_token` e `refresh_token`. ' +
      'Após o logout, qualquer requisição a endpoints protegidos retornará 401.',
  })
  @ApiResponse({ status: 200, description: 'Sessão encerrada e cookies removidos.' })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax', path: '/' });
    return { message: 'Logout realizado com sucesso' };
  }

  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description:
      'Envia um e-mail com link de redefinição de senha para o endereço informado. ' +
      'Por segurança, a resposta é sempre a mesma independente de o e-mail existir ou não — ' +
      'isso evita que um atacante descubra quais e-mails estão cadastrados. ' +
      'O link expira em 1 hora.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'usuario@sigma.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Resposta enviada (independente de o e-mail existir).' })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @ApiOperation({
    summary: 'Redefinir senha',
    description:
      'Redefine a senha do usuário utilizando o token recebido por e-mail. ' +
      'O token é de uso único e expira em 1 hora após a geração. ' +
      'Após a redefinição bem-sucedida, o token é invalidado — ' +
      'tentativas de reutilizá-lo retornarão erro.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: { type: 'string', description: 'Token recebido no e-mail de redefinição' },
        newPassword: { type: 'string', example: 'NovaSenha456!' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
