import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, App } from 'src/typeorm/entities';
import { ProfileController } from 'src/profile/profile.controller';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, App])],
  controllers: [AppsController, ProfileController],
  providers: [AppsService, UsersService, AuthMiddleware, ProfileService],
})
export class AppsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'apps*',
      version: '*',
      method: RequestMethod.ALL,
    });

    consumer.apply(AuthMiddleware).forRoutes({
      path: 'profile*',
      version: '*',
      method: RequestMethod.ALL,
    });
  }
}
