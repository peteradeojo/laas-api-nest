import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App } from './schema/apps.schema';
import { AppsDto } from './dto/apps.dto';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppsService {
  constructor(
    @InjectModel(App.name) private readonly appsModel: Model<App>,
    private configService: ConfigService,
  ) { }

  async getApps(userId: string): Promise<ServiceResponse> {
    const apps = await this.appsModel.find({ user: userId }, '-user');

    return {
      success: true,
      statusCode: 200,
      data: { apps },
    };
  }

  async getApp(id: string): Promise<ServiceResponse> {
    const app = await this.appsModel.findById(id);

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

  async createApp(data: AppsDto) {
    const app = new this.appsModel(data);
    return await app.save();
  }

  async createAppToken(id: string): Promise<ServiceResponse> {
    const app = await this.appsModel.findById(id);

    if (!app) {
      return {
        success: false,
        statusCode: 404,
        message: 'App not found',
      };
    }

    const token = sign(
      {
        id: app._id,
      },
      this.configService.get<string>('JWT_SECRET', 'secret'),
      {
        algorithm: 'HS256',
      },
    );

    app.token = token;
    await app.save();

    return {
      success: true,
      statusCode: 200,
      data: app,
    };
  }

  async getAppCount() {
    return await this.appsModel.countDocuments();
  }
}
