import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // Puede ser user_name o email

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}