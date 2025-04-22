import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  image: string;
}
