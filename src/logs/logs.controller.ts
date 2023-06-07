import { Controller, Get, Post, Body, Param, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentResponse } from 'src/interfaces/response.interface';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly logService: LogsService) {}

  @Get(':app')
  async getLogs(@Param('app') app: string, @Res() res: Response): SentResponse {
    const { success, data, statusCode, message } =
      await this.logService.getLogs(app);

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

  @Post()
  async saveLog(
    @Body() body: CreateLogDto,
    @Req() req: Request,
    @Res() res: Response,
  ): SentResponse {
    const appToken = req.header('APP_ID');

    if (!appToken) {
      return res.status(401).json({
        message: 'App token is required',
      });
    }

    const { success, statusCode, data, message } =
      await this.logService.saveLog(body, appToken as string);

    return res.status(statusCode).json({
      message,
      data
    });
  }
}
