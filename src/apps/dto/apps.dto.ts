import { IsNotEmpty, IsString } from 'class-validator';

export class AppsDto {
  @IsNotEmpty() @IsString()
  readonly title: string;

  user?: string;
}
