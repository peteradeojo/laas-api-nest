import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
