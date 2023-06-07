import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    const user = await this.authService.register(body);
    if (!user) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    return res.status(201).json({
      message: 'User created successfully',
      data: { user },
    });
  }

  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    const { statusCode, success, data, message } = await this.authService.login(
      body,
    );

    if (success) {
      return res.status(200).json({
        message: 'Login successful',
        data,
      });
    }

    return res.status(401).json({
      message: message || 'Invalid credentials',
    });
  }
}
