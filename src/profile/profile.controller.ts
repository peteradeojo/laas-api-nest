import { Body, Controller, Get, Inject, Patch, Req } from '@nestjs/common';
import { Locals, Request } from 'express';
import { AppsService } from 'src/apps/apps.service';
import { UpdateUserDto } from 'src/users/schema/user.schema';
import { UsersService } from 'src/users/users.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UsersService, private readonly appsService: AppsService) {}

  @Get('/')
  async getProfile(@Req() req: any) {
    const { data } = await this.appsService.getApps(req.user.id);
    return {
      user: req.user,
      apps: data.apps,
    };
  }

  @Patch('/')
  async updateProfile(@Body() body: UpdateUserDto, @Req() req: any) {
    return await this.userService.updateUser(req.user.id, body);
  }
}
