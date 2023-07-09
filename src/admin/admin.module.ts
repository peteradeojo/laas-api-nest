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
import { TypeOrmModule } from '@nestjs/typeorm';
import { User as UserEntity, App as AppEntity } from 'src/typeorm/entities';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: App.name, schema: AppsSchema }]),
    AuthModule,
    TypeOrmModule.forFeature([UserEntity, AppEntity]),
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
