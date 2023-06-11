import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogLevels } from './schema/logs.schema';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { CreateLogDto } from './dto/create-log.dto';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
    private readonly config: ConfigService,
  ) {}

  async getLogs(
    appId: string,
    page: number = 1,
    count: number = 20,
  ): Promise<ServiceResponse> {
    const query = this.logModel.find({ app: appId });
    const total = await query.clone().countDocuments().exec();
    const logs = await query
      .skip((page - 1) * count)
      .limit(count)
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      statusCode: 200,
      data: {
        total,
        page,
        count,
        data: logs,
      },
    };
  }

  async clearLogs(app: string) {
    await this.logModel.deleteMany({ app });
  }

  private verifyAppToken(token: string): string {
    const payload = verify(
      token,
      this.config.get<string>('JWT_SECRET', 'secret'),
    );
    // console.log(payload);
    return (payload as any).id;
  }

  async saveLog(
    data: CreateLogDto,
    appToken: string,
  ): Promise<ServiceResponse> {
    data.app = this.verifyAppToken(appToken);
    data.level ??= LogLevels.DEBUG;
    const log = await this.logModel.create(data);

    return {
      success: true,
      statusCode: 200,
      data: log,
    };
  }
}
