import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigService],
  providers: [UsersService]
})
export class UsersModule {}
