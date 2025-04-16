import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
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
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /** Los usuarios pueden modificar estos campos */
  
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  user_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @IsOptional()
  @Validate(MatchPassword, ['password'])
  passwordConfirmation?: string;

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

  /** Solo los administradores pueden modificar estos campos */
  
  @IsOptional()
  @IsEnum(Role, { message: 'role must be either user, admin, or moderator' })
  role?: Role;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsDateString()
  verificationCodeExpiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  banned?: boolean; // NUEVO: Permite actualizar el estado de baneo
}
