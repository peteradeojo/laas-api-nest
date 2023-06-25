import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppsDto {
  @IsNotEmpty() @IsString()
  readonly title: string;

  @IsOptional() @IsString()
  readonly description?: string;

  user?: string;
}
