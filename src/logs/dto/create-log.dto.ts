import { IsIP, IsIn, IsOptional, IsString } from 'class-validator';
import { LogLevels } from '../schema/logs.schema';

export class CreateLogDto {
  @IsString()
  text: string;

  @IsString()
  @IsIn(Object.values(LogLevels))
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  app: string;

  @IsIP()
  @IsOptional()
  ip?: string;
}
