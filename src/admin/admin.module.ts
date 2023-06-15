import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { AdminMiddleware } from './admin.middleware';
import { AppsService } from 'src/apps/apps.service';
import { ConfigService } from '@nestjs/config';
import { App, AppsSchema } from 'src/apps/schema/apps.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: App.name, schema: AppsSchema }]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [UsersService, AppsService, ConfigService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, AdminMiddleware).exclude({
        path: '/admin/auth/login',
        method: RequestMethod.POST
      }).forRoutes('admin');
  }
}
