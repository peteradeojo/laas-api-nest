import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { LogLevels } from './schema/logs.schema';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { CreateLogDto } from './dto/create-log.dto';
import { LogsGateway } from './logs.gateway';
import { Log } from 'src/typeorm/entities';

@Injectable()
export class LogsService {
  constructor(
    // @InjectModel(Log.name) private readonly logModel: Model<Log>,
    private readonly config: ConfigService,
    @Inject(LogsGateway) private readonly logsGateway: LogsGateway,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) { }

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
    await this.logRepository.delete({ id });
  }

  async clearLogs(app: string) {
    await this.logRepository.delete({ app });
  }

  private verifyAppToken(token: string): string {
    const payload = verify(token, this.config.get<string>('JWT_SECRET', 'secret'));
    return (payload as any).id;
  }

  async saveLog(data: CreateLogDto, appToken: string): Promise<ServiceResponse> {
    data.app = this.verifyAppToken(appToken);
    data.level ??= LogLevels.DEBUG;
    const log = this.logRepository.create(data);
    await this.logRepository.save(log);

    this.logsGateway.sendLog(data.app, log);

    return {
      success: true,
      statusCode: 200,
      data: log,
    };
  }
}
