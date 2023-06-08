import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { MongooseModule } from '@nestjs/mongoose';
import { App, AppsSchema } from './schema/apps.schema';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: App.name,
        schema: AppsSchema,
      },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [AppsController],
  providers: [AppsService, UsersService],
})
export class AppsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppsController);
  }
}
