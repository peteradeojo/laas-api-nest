import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, App } from 'src/typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, App])
  ],
  controllers: [AppsController],
  providers: [AppsService, UsersService, AuthMiddleware],
})
export class AppsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'apps*',
      version: '*',
      method: RequestMethod.ALL,
    });
  }
}
