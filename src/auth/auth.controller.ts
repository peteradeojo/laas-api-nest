import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    const { success, statusCode, data, message } =
      await this.authService.register(body);

    if (!success) {
      return res.status(statusCode).json({
        message,
      });
    }

    return res.status(statusCode).json({
      message,
      data,
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
