import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Senha inválida');

    const payload = { sub: user.id, email: user.email };
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET não definido');

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: refreshSecret,
      }),
      user: { id: user.id, name: user.name ?? null, email: user.email },
    };
  }

  // REFRESH TOKEN
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
      });

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh inválido');
    }
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    // sempre retorna sucesso pra não vazar se email existe
    if (!user)
      return { message: 'Se o email existir, você receberá as instruções.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await this.usersService.saveResetToken(user, token, expiry);

    const appUrl = this.configService.get<string>('APP_URL');
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Redefinição de senha — Sigma',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Redefinição de senha</title>
        </head>
        <body style="margin:0;padding:0;background-color:#F5F1E6;font-family:Georgia,serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E6;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color:#2C1A0E;padding:36px 40px;border-radius:16px 16px 0 0;">
                      <h1 style="margin:0;color:#F5F1E6;font-size:24px;letter-spacing:-0.02em;">SIGMA</h1>
                      <p style="margin:6px 0 0;color:#8B7355;font-size:11px;font-family:Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">
                        Sistema de Gestão de Madeireiras
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background-color:#FFFFFF;padding:40px;border-left:1px solid rgba(44,26,14,0.08);border-right:1px solid rgba(44,26,14,0.08);">

                      <p style="margin:0 0 8px;font-size:20px;color:#2C1A0E;font-family:Georgia,serif;">
                        Olá, ${user.name}!
                      </p>
                      <p style="margin:0 0 24px;font-size:14px;color:#7A6555;font-family:Arial,sans-serif;line-height:1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                      </p>

                      <!-- Botão -->
                      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                          <td align="center" style="background-color:#2D6A4F;border-radius:10px;box-shadow:0 4px 14px rgba(45,106,79,0.35);">
                            <a href="${resetLink}"
                              style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;">
                              Redefinir minha senha
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Aviso link -->
                      <p style="margin:0 0 8px;font-size:12px;color:#A89888;font-family:Arial,sans-serif;line-height:1.6;">
                        Ou copie e cole este link no seu navegador:
                      </p>
                      <p style="margin:0 0 24px;font-size:11px;color:#8B7355;font-family:Arial,sans-serif;word-break:break-all;">
                        ${resetLink}
                      </p>

                      <!-- Divider -->
                      <hr style="border:none;border-top:1px solid rgba(44,26,14,0.08);margin:0 0 24px;" />

                      <p style="margin:0;font-size:12px;color:#A89888;font-family:Arial,sans-serif;line-height:1.6;">
                        ⏱ Este link expira em <strong style="color:#7A6555;">1 hora</strong>.<br/>
                        🔒 Se não foi você quem solicitou, ignore este email — sua senha não será alterada.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color:#2C1A0E;padding:20px 40px;border-radius:0 0 16px 16px;">
                      <p style="margin:0;font-size:11px;color:#6B5040;font-family:Arial,sans-serif;">
                        © 2026 Sigma · Sistema de Gestão de Madeireiras
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,
    });

    return { message: 'Se o email existir, você receberá as instruções.' };
  }

  // RESET PASSWORD
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException('Token inválido');
    }

    if (user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user, passwordHash);
    await this.usersService.clearResetToken(user);

    return { message: 'Senha redefinida com sucesso' };
  }
}
