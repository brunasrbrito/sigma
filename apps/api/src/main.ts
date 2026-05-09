import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Sigma API')
    .setDescription(
      'API do sistema Sigma — controle de estoque de madeira. ' +
      'Gerencia produtos, fornecedores, lotes (DOF), movimentações, desmembramentos e estoque.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação')
    .addTag('products', 'Produtos (espécies de madeira)')
    .addTag('suppliers', 'Fornecedores')
    .addTag('lots', 'Lotes de entrada com DOF')
    .addTag('stock', 'Estoque atual')
    .addTag('movements', 'Movimentações de saída e ajuste')
    .addTag('dismemberments', 'Desmembramentos')
    .addTag('dof', 'Controle de DOF')
    .addTag('dashboard', 'Dashboard resumido')
    .addTag('users', 'Usuários')
    .addTag('profiles', 'Perfis de acesso')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
