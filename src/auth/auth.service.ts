import { Injectable, Res } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto/register.dto';
import { User } from '../users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { ServiceResponse } from 'src/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
  ) {}

  async login(data: LoginDTO): Promise<ServiceResponse> {
    const token = await this.userService.authenticate(data);

    if (token) {
      return {
        success: true,
        statusCode: 200,
        data: {
          token,
        }
      };
    }

    return {
      statusCode: 400,
      success: false,
      message: 'Invalid credentials',
    };
  }

  async register(data: RegisterDTO): Promise<User> {
    const user = await this.userService.registerUser(data);
    return user;
  }
}
