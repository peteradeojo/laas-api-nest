import { IsNotEmpty, IsOptional, IsString, IsStrongPassword, ValidateIf } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // @IsStrongPassword()
  // password: string;

  // @IsOptional()
  // @ValidateIf((o, v) => {
  //   console.log(v === o.password);
  //   console.log(v !== o.password);
  //   return v != o.password;
  // }, { message: "Password confirmation must match password" })
  // @IsString()
  // password_confirmation: string;
}