import { Injectable, Res } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { User } from 'src/typeorm/entities';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async login(data: LoginDTO): Promise<ServiceResponse> {
    return await this.userService.authenticate(data);
  }

  async register(data: RegisterDTO): Promise<ServiceResponse> {
    return await this.userService.registerUser(data);
  }

  async enable2fa(user: User, secret: string): Promise<ServiceResponse> {
    if (user.twoFactorEnabled) {
      return {
        success: false,
        statusCode: 400,
        message: '2FA already enabled',
      };
    }

    return await this.userService.enable2fa(user, secret);
  }

  async validate2fa(email: string, token: string): Promise<ServiceResponse> {
    return await this.userService.validate2fa(email, token);
  }
}
