import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/users/schema/user.schema";
import { AuthMiddleware } from "src/auth/auth.middleware";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), UsersModule
  ],
  controllers: [AuthController],
  providers: [UsersService]
})
export class AuthModule {
}