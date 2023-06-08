import { IsIP, IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { LogLevels } from '../schema/logs.schema';

export class CreateLogDto {
  @IsString()
  text: string;

  @IsString()
  @IsIn(Object.values(LogLevels))
  @IsOptional()
  level?: string;

  @IsMongoId()
  @IsOptional()
  app: string;

  @IsIP()
  ip?: string;
}
