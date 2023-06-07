import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { hashSync, compareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findOne(query: object) {
    return await this.userModel.findOne(query);
  }

  async registerUser(data) {
    const user = new this.userModel(data);
    user.password = hashSync(
      data.password,
      parseInt(this.configService.get<string>('BCRYPT_SALT', '10')),
    );
    return await user.save();
  }

  async authenticate(data) {
    const user = await this.userModel.findOne({ email: data.email });

    if (compareSync(data.password, user.password)) {
      const token = sign(
        { id: user._id },
        this.configService.get<string>('JWT_SECRET', 'secret'),
        {
          algorithm: 'HS256',
          expiresIn: this.configService.get<string|number>('JWT_EXPIRY', '1d'),
        },
      );

      user.password = undefined;
      return token;
    }
  }
}
