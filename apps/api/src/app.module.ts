import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { LotsModule } from './lots/lots.module';
import { StockModule } from './stock/stock.module';
import { MovementsModule } from './movements/movements.module';
import { DismembermentsModule } from './dismemberments/dismemberments.module';
import { DofModule } from './dof/dof.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'sigma.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,
    UsersModule,
    DashboardModule,
    ProfilesModule,
    ProductsModule,
    SuppliersModule,
    LotsModule,
    StockModule,
    MovementsModule,
    DismembermentsModule,
    DofModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
