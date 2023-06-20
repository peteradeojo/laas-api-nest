import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    bearerToken = bearerToken.split('Bearer ')[1];

    const payload = verify(bearerToken, process.env.JWT_SECRET);

    if (typeof payload == 'string') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await this.userService.findOne({ _id: payload.id });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // user.password = undefined;
    (req as any).user = user;
    return next();
  }
}
