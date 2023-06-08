import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { hashSync, compareSync, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { LoginDTO, RegisterDTO } from 'src/auth/dto';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOne(query: object) {
    return await this.userModel.findOne(query);
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
}
