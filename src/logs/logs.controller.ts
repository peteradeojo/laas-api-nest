import { Controller, Get, Post, Body, Param, Res, Req, Query, Delete, Inject } from '@nestjs/common';
import { Request, Response, query } from 'express';
import { SentResponse } from 'src/interfaces/response.interface';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { LogLevels } from './schema/logs.schema';
import { AppsService } from 'src/apps/apps.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logService: LogsService, private readonly appService: AppsService) {}

  @Get(':app')
  async getLogs(@Param('app') app: string, @Res() res: Response, @Query() query): SentResponse {
    const { success, data, statusCode, message } = await this.logService.getLogs(
      app,
      query.page || 1,
      query.count || 20,
      query,
    );

    if (!success) {
      return res.status(statusCode).json({
        message,
      });
    }

    return res.status(statusCode).json(data);
  }

  @Delete('/:id/delete')
  async deleteLog(@Param('id') id: string, @Res() res: Response): SentResponse {
    await this.logService.deleteLog(id);
    return res.status(200).json({
      message: 'Log deleted successfully',
    });
  }

  @Delete('/:app')
  async clearLogs(@Param('app') app: string, @Res() res: Response): SentResponse {
    await this.logService.clearLogs(app);
    return res.status(200).json({
      message: 'Logs cleared successfully',
    });
  }

  @Post()
  async saveLog(@Body() body: CreateLogDto, @Req() req: Request, @Res() res: Response): SentResponse {
    const appToken = req.header('APP_ID');

    if (!appToken) {
      return res.status(401).json({
        message: 'App token is required',
      });
    }

    if (Object.values(LogLevels).includes(body.level as LogLevels) === false) {
      body.level = 'unknown';
    }

    const app = await this.appService.verifyAppToken(appToken as string);

    if (!app) return res.status(401).json({ message: 'Invalid app token' });

    body.app = app;
    body.ip ??= req.ip;

    const { statusCode, data, message } = await this.logService.saveLog(body, appToken as string);

    return res.status(statusCode).json({
      message,
      data,
    });
  }
}
