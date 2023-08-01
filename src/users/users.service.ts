import { Injectable } from '@nestjs/common';
import { User } from '../typeorm/entities/User';
import { hashSync, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { ServiceResponse } from 'src/interfaces/response.interface';
import { LoginDTO, RegisterDTO } from 'src/auth/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './schema/user.schema';

const speakeasy = require('speakeasy');

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOne(query: object, cache: boolean | number = true): Promise<Readonly<any>> {
    const user = await this.userRepository.findOne({ where: query, cache });
    if (!user) {
      return undefined;
    }
    // user.password = undefined;
    return user;
  }

  async getUser(id: string | object): Promise<any | undefined> {
    if (typeof id == 'object') {
      const user = await this.userRepository.findOne({ where: id, cache: 100 * 60 * 5 });
      return user;
    }

    const user = await this.userRepository.findBy({ id });
    return user;
  }

  async registerUser(data: RegisterDTO): Promise<any> {
    if (await this.userRepository.findOne({ where: { email: data.email } })) {
      return {
        success: false,
        statusCode: 400,
        message: 'User already exists',
      };
    }

    const user = this.userRepository.create(data);
    // return user;

    user.password = hashSync(data.password, parseInt(this.configService.get<string>('BCRYPT_SALT', '10')));
    await this.userRepository.save(user);

    return await this.authenticate(data);
  }

  async authenticate(data: LoginDTO, ignore2FA = false): Promise<ServiceResponse> {
    const user = await this.userRepository.findOne({
      select: ['password', 'email', 'id', 'twoFactorEnabled'],
      where: { email: data.email },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      };
    }

    const result = await compare(data.password, user.password);

    if (result || ignore2FA) {
      user.password = undefined;

      if (!ignore2FA) {
        if (user.twoFactorEnabled) {
          return {
            success: true,
            statusCode: 200,
            data: {
              twoFactorEnabled: true,
              // user,
            },
          };
        }
      }

      const token = sign({ id: user.id }, this.configService.get<string>('JWT_SECRET', 'secret'), {
        algorithm: 'HS256',
        expiresIn: this.configService.get<string | number>('JWT_EXPIRY', '1d'),
      });

      return {
        success: true,
        statusCode: 200,
        data: {
          token,
          // user,
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
    return await this.userRepository.count();
  }

  async getUsers(query: any): Promise<ServiceResponse> {
    const isRecent = Object.getOwnPropertyNames(query).includes('recent');
    const limit = query.count || 20;

    try {
      let userquery = this.userRepository.createQueryBuilder().cache(100 * 60 * 5);

      if (isRecent) {
        const date = new Date().valueOf() - 1000 * 60 * 60 * 24 * 5;
        userquery = userquery.where('createdAt >= :createdAt', { createdAt: date.valueOf() }).take(limit);
      } else {
        const page = query.page || 1;
        userquery = userquery.skip((page - 1) * limit).take(limit);
      }

      const users = await userquery.orderBy('createdAt').getMany();

      return {
        success: true,
        statusCode: 200,
        data: users,
        message: 'Users fetched successfully',
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        message: err.message,
      };
    }
  }

  async updateUser(id: string | number, body: Partial<UpdateUserDto>) {
    try {
      await this.userRepository.update({ id }, body);
      return {
        message: 'User updated successfully',
      };
    } catch (err) {
      throw err;
    }
  }

  async enable2fa(user: User, secret: string): Promise<ServiceResponse<User>> {
    user.twoFactorEnabled = true;
    user.twoFactorSecret = sign(
      {
        secret,
      },
      this.configService.get<string>('JWT_SECRET'),
      {
        algorithm: 'HS256',
      },
    );

    try {
      await this.userRepository.save(user);
      return {
        success: true,
        statusCode: 200,
        message: '2FA enabled successfully',
        data: user,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: 500,
        message: err.message,
      };
    }
  }

  async validate2fa(email: string, token: string): Promise<ServiceResponse> {
    const user = await this.userRepository.findOne({ where: { email }, select: ['twoFactorSecret'] });

    if (!user) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      };
    }

    const userSecret = verify(user.twoFactorSecret, this.configService.get<string>('JWT_SECRET'), {
      algorithms: ['HS256'],
    });

    if (typeof userSecret == 'string') {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid credentials',
      };
    }

    const verified = speakeasy.totp.verify({
      secret: userSecret.secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      return await this.authenticate({ email, password: '' }, true);
    }

    return {
      success: false,
      statusCode: 400,
      message: 'Invalid token',
    };
  }
}
