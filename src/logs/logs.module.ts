import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogsSchema } from './schema/logs.schema';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { App, AppsSchema } from 'src/apps/schema/apps.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Log.name, schema: LogsSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [LogsController],
  providers: [LogsService, UsersService],
})
export class LogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'logs', method: RequestMethod.POST })
      .forRoutes(LogsController);
  }
}
