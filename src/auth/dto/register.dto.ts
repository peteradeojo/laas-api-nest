import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => {
    return o.password !== o.password_confirmation;
  })
  readonly password_confirmation: string;
}

export class LoginDTO extends PickType(RegisterDTO, ['email', 'password']) {}
