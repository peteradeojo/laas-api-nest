import { IsNotEmpty, IsString, Length } from 'class-validator';

export default class Enable2FADTO {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  readonly token: string;

  @IsNotEmpty()
  @IsString()
  readonly secret: string;
}
