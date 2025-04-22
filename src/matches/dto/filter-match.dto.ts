import { IsOptional, IsEnum, IsNumber, IsString, IsBoolean } from 'class-validator';

export class FilterMatchDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  radius?: number; // en km

  @IsOptional()
  @IsEnum(['5', '8', '11'])
  type?: '5' | '8' | '11';

  @IsOptional()
  @IsString()
  date?: string; // formato: '2025-04-18'

  @IsOptional()
  @IsString()
  timeFrom?: string; // formato '18:00'

  @IsOptional()
  @IsString()
  timeTo?: string; // formato '20:00'

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'cancelled';

  @IsOptional()
  @IsBoolean()
  hasVacancy?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // ejemplo: true = sin password
}
