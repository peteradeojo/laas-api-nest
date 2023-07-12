import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppsService } from 'src/apps/apps.service';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UsersService,
    private readonly appService: AppsService,
  ) { }

  @Get('analytics')
  async analytics(@Res() res: Response) {
    const userCount = await this.userService.getUserCount();
    const appCount = await this.appService.getAppCount();

    return res.status(200).json({
      data: {
        users: {
          total: userCount,
        },
        apps: {
          total: appCount,
        }
      }
    });
  }

  @Get('users')
  async getUsers(@Query() query: any, @Res() res: Response) {
    const result = await this.userService.getUsers(query);

    return res.status(result.statusCode).json({
      data: result.data,
      message: result.message
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: any, @Res() res: Response) {
    const user = await this.userService.findOne({ _id: id });
    const userApps = await this.appService.getApps(id);

    if (!userApps.success) {
      return res.status(userApps.statusCode).json(userApps.data);
    }

    if (!user) {
      return res.status(404).json({
        message: 'user not found'
      })
    }

    return res.status(200).json({ ...user._doc, apps: userApps.data?.apps ?? [] });
  }
}
