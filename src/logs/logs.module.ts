import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersService } from 'src/users/users.service';
import { LogsGateway } from './logs.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Log } from 'src/typeorm/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Log])],
  controllers: [LogsController],
  providers: [LogsService, UsersService, LogsGateway],
})
export class LogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude({ path: 'logs', method: RequestMethod.POST }).forRoutes(LogsController);
  }
}
