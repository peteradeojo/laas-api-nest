import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDTO } from 'src/auth/dto';
import { UserRole } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';

@Controller('admin/auth')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    const user = await this.usersService.findOne({ email: body.email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    if (user.role !== UserRole.ADMIN)
      return res.status(403).json({
        message: 'Forbidden',
      });

    // return res.json(user);

    const result = await this.usersService.authenticate(body);

    return res.json({ ...result });

    if (!result.success) {
      return res.status(result.statusCode).json({
        message: result.message,
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      data: result.data,
    });
  }

  @Get('/')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    return res.status(200).json((req as any).user);
  }
}
