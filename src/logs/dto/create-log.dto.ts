import { IsIP, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { LogLevels } from '../schema/logs.schema';

export class CreateLogDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsNumber()
  @IsOptional()
  app: string | number;

  @IsIP()
  @IsOptional()
  ip?: string;
}
