import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities";
import { Repository } from "typeorm";

@Injectable()
export class ProfileService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>) { }
}