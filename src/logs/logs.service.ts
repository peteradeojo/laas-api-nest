import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LogLevels } from './schema/logs.schema';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { CreateLogDto } from './dto/create-log.dto';
import { LogsGateway } from './logs.gateway';
import { Log } from 'src/typeorm/entities';

@Injectable()
export class LogsService {
  constructor(
    @Inject(LogsGateway) private readonly logsGateway: LogsGateway,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
    @InjectEntityManager() private readonly repository: EntityManager,
  ) {}

  async getLogs(appId: string, page = 1, count = 20, queryParams?: any): Promise<ServiceResponse> {
    let query = this.logRepository.createQueryBuilder('logs').where('appId = :appId', { appId });
    let total = query.clone();

    if (queryParams?.level) {
      query = query.andWhere('level = :level', { level: queryParams.level });
      total = total.andWhere('level = :level', { level: queryParams.level }); //.countDocuments();
    }

    if (queryParams?.search) {
      query = query.andWhere('text like :search', { search: `${queryParams.search}%` });
      total = total.andWhere('text like :search', { search: `${queryParams.search}%` }); //.countDocuments();
    }

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

  async saveLog(data: CreateLogDto, appToken: string): Promise<ServiceResponse> {
    data.level ??= LogLevels.DEBUG;
    const log = this.logRepository.create(data);
    await this.logRepository.save(log);

    this.logsGateway.sendLog(log.app as string, log);

    return {
      success: true,
      statusCode: 200,
      data: log,
    };
  }

  async getAppMetrics(id: string | number) {
    try {
      const data = await this.repository.query('SELECT count(id), level from logs where appId = ? GROUP BY level', [
        id,
      ]);
      return data;
    } catch (err: any) {
      return { message: err.message };
    }
  }
}
