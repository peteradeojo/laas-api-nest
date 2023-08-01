import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App, Log, User } from './typeorm/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: (process.env.DB_TYPE as any) || 'mysql',
        host: process.env.SQL_HOST,
        port: parseInt(process.env.SQL_PORT),
        username: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        entities: [User, App, Log],
        cache: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    AppsModule,
    LogsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
