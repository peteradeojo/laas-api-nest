import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogLevels } from './schema/logs.schema';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { CreateLogDto } from './dto/create-log.dto';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { LogsGateway } from './logs.gateway';
import { Log as LogEntity } from 'src/typeorm/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
    private readonly config: ConfigService,
    @Inject(LogsGateway) private readonly logsGateway: LogsGateway,
    @InjectRepository(LogEntity) private readonly logRepository: Repository<LogEntity>,
  ) {}

  async getLogs(appId: string, page: number = 1, count: number = 20, queryParams?: any): Promise<ServiceResponse> {
    const query = this.logRepository.createQueryBuilder('logs').where('app = :appId', { appId });
    let total = query.clone();

    if (queryParams?.level) {
      query.where('level', queryParams.level);
      // total = total.where('level', queryParams.level); //.countDocuments();
    }

    if (queryParams?.search) {
      query.where('text Like %:search%', { search: queryParams.search });
      // total = total.where('text', new RegExp(queryParams.search, 'i')); //.countDocuments();
    }

    const logs = await query
      .skip((page - 1) * count)
      .take(count)
      .orderBy('createdAt', 'DESC')
      .getMany();

    return {
      success: true,
      statusCode: 200,
      data: {
        total: await total.getCount(),
        page,
        count,
        data: logs,
      },
    };
  }

  async deleteLog(id: string) {
    await this.logModel.findByIdAndDelete(id);
  }

  async clearLogs(app: string) {
    await this.logModel.deleteMany({ app });
  }

  private verifyAppToken(token: string): string {
    const payload = verify(token, this.config.get<string>('JWT_SECRET', 'secret'));
    return (payload as any).id;
  }

  async saveLog(data: CreateLogDto, appToken: string): Promise<ServiceResponse> {
    data.app = this.verifyAppToken(appToken);
    data.level ??= LogLevels.DEBUG;
    const log = await this.logModel.create(data);

    this.logsGateway.sendLog(data.app, log);

    return {
      success: true,
      statusCode: 200,
      data: log,
    };
  }
}
