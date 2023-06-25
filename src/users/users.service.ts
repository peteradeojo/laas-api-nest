import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Document, Model } from 'mongoose';
import { hashSync, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { LoginDTO, RegisterDTO } from 'src/auth/dto';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async findOne(query: object): Promise<Readonly<any>> {
    const user = await this.userModel.findOne(query);
    user.password = undefined;
    return user;
  }

  async getUser(id: string | object): Promise<Document<any, any, User> | undefined> {
    if (typeof id == 'object') {
      const user = await this.userModel.findOne(id);
      return user;
    }

    const user = await this.userModel.findById(id);
    return user;
  }

  async registerUser(data: RegisterDTO): Promise<ServiceResponse> {
    if (await this.userModel.findOne({ email: data.email })) {
      return {
        success: false,
        statusCode: 400,
        message: 'User already exists',
      };
    }

    const user = new this.userModel(data);
    user.password = hashSync(
      data.password,
      parseInt(this.configService.get<string>('BCRYPT_SALT', '10')),
    );
    await user.save();

    return await this.authenticate(data);
  }

  async authenticate(data: LoginDTO): Promise<ServiceResponse> {
    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      };
    }

    const result = await compare(data.password, user.password);

    if (result) {
      user.password = undefined;
      const token = sign(
        { id: user._id },
        this.configService.get<string>('JWT_SECRET', 'secret'),
        {
          algorithm: 'HS256',
          expiresIn: this.configService.get<string | number>(
            'JWT_EXPIRY',
            '1d',
          ),
        },
      );

      return {
        success: true,
        statusCode: 200,
        data: {
          token,
          user,
        },
      };
    }

    return {
      success: false,
      statusCode: 400,
      message: 'Invalid credentials',
    };
  }

  async getUserCount() {
    return await this.userModel.countDocuments();
  }

  async getUsers(query: any): Promise<ServiceResponse> {
    const isRecent = Object.getOwnPropertyNames(query).includes('recent');
    const limit = query.count || 20;

    try {
      let userquery = this.userModel.find({}); //.where({ role: { $ne: 'admin' } });

      if (isRecent) {
        const date = (new Date()).valueOf() - (1000 * 60 * 60 * 24 * 5)
        userquery = userquery.where({ createdAt: { $gte: new Date(date) } }).limit(limit);
      } else {
        const page = query.page || 1;
        userquery = userquery.skip((page - 1) * limit).limit(limit);
      }

      const users = await userquery.sort({ createdAt: -1 }).exec();

      return {
        success: true,
        statusCode: 200,
        data: users,
        message: 'Users fetched successfully',
      }

    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        message: err.message,
      }
    }
  }
}
