import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersService } from 'src/users/users.service';
import { AdminMiddleware } from './admin.middleware';
import { AppsService } from 'src/apps/apps.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, App } from 'src/typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, App]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [UsersService, AppsService, ConfigService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, AdminMiddleware)
      .exclude({
        path: '/admin/auth/login',
        version: '*',
        method: RequestMethod.POST,
      })
      .forRoutes({ path: 'admin/*', version: '*', method: RequestMethod.ALL });
  }
}
