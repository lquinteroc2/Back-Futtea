// import { PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { MatchPassword } from '../../decorators/matchPassword.decorator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  passwordConfirmation: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address?: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone must be 10 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city?: string;

  @IsOptional() // Opcional si no quieres que los usuarios establezcan su propio rol
  @IsEnum(Role, { message: 'role must be either user, admin, or moderator' })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsDateString()
  verificationCodeExpiresAt?: Date;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  banned?: boolean; // NUEVO: Permite establecer si el usuario inicia baneado
}

// export class LoginUserDto extends PickType(CreateUserDto, [
//   'email',
//   'password',
// ]) {}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}