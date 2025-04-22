import { IsNotEmpty, Matches, IsDateString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // Ej: "2025-04-21"

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string; // Ej: "09:00"

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  endTime: string; // Ej: "10:30"

  @IsUUID()
  @IsNotEmpty()
  fieldId: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
