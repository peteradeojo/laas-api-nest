import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { AuthMiddleware } from './auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: '/auth/register',
          version: '*',
          method: RequestMethod.ALL,
        },
        {
          path: '/auth/login',
          version: '*',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes({
        path: '/auth',
        version: '*',
        method: RequestMethod.GET,
      });
  }
}
