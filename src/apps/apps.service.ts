import { Injectable } from '@nestjs/common';
import { AppsDto } from './dto/apps.dto';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App } from 'src/typeorm/entities';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App) private readonly appsRepository: Repository<App>,
    private configService: ConfigService,
  ) {}

  async getApps(userId: string): Promise<ServiceResponse> {
    const apps = await this.appsRepository.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
      },
    });

    return {
      success: true,
      statusCode: 200,
      data: { apps },
    };
  }

  async getApp(id: string): Promise<ServiceResponse> {
    const app = await this.appsRepository.findOneBy({ id });

    if (!app) {
      return {
        success: false,
        statusCode: 404,
        message: 'App not found',
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: app,
    };
  }

  async createApp(data: any) {
    const app = this.appsRepository.create({ ...data });
    // return app;
    return await this.appsRepository.save(app);
  }

  async createAppToken(id: string): Promise<ServiceResponse> {
    const app = await this.appsRepository.findOneBy({ id });

    if (!app) {
      return {
        success: false,
        statusCode: 404,
        message: 'App not found',
      };
    }

    const token = sign(
      {
        id: app.id,
      },
      this.configService.get<string>('JWT_SECRET', 'secret'),
      {
        algorithm: 'HS256',
      },
    );

    app.token = token;
    await this.appsRepository.save(app);

    return {
      success: true,
      statusCode: 200,
      data: app,
    };
  }

  async getAppCount() {
    return await this.appsRepository.count();
  }

  async updateApp(id: string, data: AppsDto): Promise<ServiceResponse> {
    try {
      let app = (await this.appsRepository.update({ id: id }, data as any));

      return {
        success: true,
        statusCode: 200,
        message: 'App updated successfully',
      };
    } catch (err: any) {
      console.error(err.message);
      return {
        success: false,
        statusCode: 500,
        message: 'Something went wrong',
      };
    }
  }
}
