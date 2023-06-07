import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Equals, Matches, ValidateIf } from 'class-validator';
import {PickType} from '@nestjs/mapped-types';

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;

  @IsStrongPassword()
  @ValidateIf((o) => {
    return o.password !== o.password_confirmation;
  })
  readonly password_confirmation: string;
}

export class LoginDTO extends PickType(RegisterDTO, ['email', 'password']) {}