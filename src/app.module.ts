import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App, User } from './typeorm/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.SQL_HOST,
      port: parseInt(process.env.SQL_PORT),
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      entities: [User, App],
      cache: true,
      synchronize: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    AppsModule,
    LogsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
