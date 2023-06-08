import { Injectable, Res } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto/register.dto';
import { User } from '../users/schema/user.schema';
import { UsersService } from 'src/users/users.service';
import { ServiceResponse } from 'src/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async login(data: LoginDTO): Promise<ServiceResponse> {
    return await this.userService.authenticate(data);
  }

  async register(data: RegisterDTO): Promise<ServiceResponse> {
    return await this.userService.registerUser(data);
  }
}
