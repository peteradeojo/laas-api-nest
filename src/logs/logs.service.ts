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
import { AppsService } from 'src/apps/apps.service';

@Injectable()
export class LogsService {
  constructor(
    private readonly config: ConfigService,
    private readonly appService: AppsService,
    @Inject(LogsGateway) private readonly logsGateway: LogsGateway,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) {}

  async getLogs(appId: string, page: number = 1, count: number = 20, queryParams?: any): Promise<ServiceResponse> {
    let query = this.logRepository.createQueryBuilder('logs').where('appId = :appId', { appId });
    let total = query.clone();

    if (queryParams?.level) {
      query = query.andWhere('level = :level', { level: queryParams.level });
      // total = total.where('level', queryParams.level); //.countDocuments();
    }

    // if (queryParams?.search) {
      query = query.andWhere('text like :search', { search: `${queryParams.search}%` });
    //   // total = total.where('text', new RegExp(queryParams.search, 'i')); //.countDocuments();
    // }

    // log the raw sql to console
    // console.log(query.printSql());

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
    console.log(app);
    const result = await this.logRepository.delete({ app });
    console.log(result);
  }

  private async verifyAppToken(token: string): Promise<string | number> {
    // const payload = verify(token, this.config.get<string>('JWT_SECRET', 'secret'));
    // return (payload as any).id;
    const app = await this.appService.getAppByToken(token);

    if (!app) {
      return;
      throw new Error('Invalid app token');
    }

    return app.id;
  }

  async saveLog(data: CreateLogDto, appToken: string): Promise<ServiceResponse> {
    const app = await this.verifyAppToken(appToken);

    if (!app) {
      return {
        success: false,
        statusCode: 200,
        message: 'Invalid app token',
      };
    }

    data.level ??= LogLevels.DEBUG;
    const log = this.logRepository.create(data);
    await this.logRepository.save(log);

    this.logsGateway.sendLog(data.app as string, log);

    return {
      success: true,
      statusCode: 200,
      data: log,
    };
  }
}
