import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, User } from '../users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
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
