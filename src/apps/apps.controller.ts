import { Body, Controller, Post, Get, Req, Res, Param, Patch, UseInterceptors } from '@nestjs/common';
import { AppsDto } from './dto/apps.dto';
import { AppsService } from 'src/apps/apps.service';
import { Request, Response } from 'express';
import { LogsService } from 'src/logs/logs.service';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService, private readonly logService: LogsService) {}

  @Post('/new')
  async newApp(@Body() body: AppsDto, @Req() req: Request, @Res() res: Response): Promise<Response> {
    body.user = (req as any).user.id;
    const data = await this.appsService.createApp({ ...body });

    return res.status(200).json({
      message: 'App created successfully',
      data,
    });
  }

  @Get()
  async getApps(@Req() req: Request, @Res() res: Response) {
    const { success, statusCode, message, data } = await this.appsService.getApps((req as any).user.id);

    if (!success) {
      return res.status(statusCode || 500).json({
        message: message || 'Something went wrong',
      });
    }

    return res.status(200).json({
      message: 'Apps fetched successfully',
      data: data.apps,
    });
  }

  @Get(':id/metrics')
  async getAppMetrics(@Param('id') id: string, @Res() res: Response) {
    const metrics = await this.logService.getAppMetrics(id);

    return res.json(metrics);
  }

  @Get(':id')
  async getApp(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const { success, statusCode, data, message } = await this.appsService.getApp(id);

    if (!success) {
      return res.status(statusCode || 500).json({
        message: message || 'Something went wrong',
      });
    }

    return res.status(200).json({
      message: 'App fetched successfully',
      data,
    });
  }

  @Post(':id/token')
  async generateAppToken(@Param('id') id: string, @Res() res: Response) {
    const response = await this.appsService.createAppToken(id);

    if (!response.success) {
      return res.status(response.statusCode || 500).json({
        message: response.message || 'Something went wrong',
      });
    }

    return res.status(200).json({
      message: 'App token generated successfully',
      data: response.data,
    });
  }

  @Patch(':id/update')
  async updateApp(@Param('id') id: string, @Body() body: AppsDto, @Res() res: Response) {
    const response = await this.appsService.updateApp(id, body);

    if (!response.success) {
      return res.status(response.statusCode || 500).json({
        message: response.message || 'Something went wrong',
      });
    }

    return res.status(200).json({
      message: response.message,
      data: response.data,
    });
  }
}
