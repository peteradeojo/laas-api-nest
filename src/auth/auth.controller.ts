import { Body, Controller, Post, Res, Get, Req } from '@nestjs/common';
import { LoginDTO, RegisterDTO, Enable2FADTO } from './dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
// import speakeasy from 'speakeasy';
// import QRCode from 'qrcode';

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    const { success, statusCode, data, message } = await this.authService.register(body);

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
    const { statusCode, success, data, message } = await this.authService.login(body);

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

  @Get('/')
  async getUser(@Req() req: Request, @Res() res: Response) {
    return res.status(200).json({
      message: 'User retrieved',
      data: {
        user: (req as any).user,
      },
    });
  }

  @Get('/2fa/setup')
  async setup2fa(@Res() res: Response) {
    const secret = speakeasy.generateSecret();

    try {
      const data = await QRCode.toDataURL(secret.otpauth_url);

      return res.status(200).json({
        message: 'QR code generated',
        data: {
          qrCode: data,
          secret: secret.base32,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Unable to generate QR code',
      });
    }
  }

  @Post('/2fa/enable')
  async enable2fa(@Body() body: Enable2FADTO, @Req() req: Partial<Request>, @Res() res: Response) {
    const { secret, token } = body;

    if (!secret || !token) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    const { success, statusCode, message } = await this.authService.enable2fa((req as any).user, secret);

    if (!success) {
      return res.status(statusCode).json({
        message,
      });
    }

    return res.status(statusCode).json({
      message,
    });
  }

  @Post('/2fa/verify')
  async verif2fa(@Body() body: any, @Res() res: Response) {
    const { email, token } = body;

    if (!email || !token) {
      return {
        success: false,
        statusCode: 400,
        message: 'Missing required fields',
      };
    }

    const { success, statusCode, message, data } = await this.authService.validate2fa(email, token);

    return res.status(statusCode).json({
      message,
      data,
    });
  }
}
