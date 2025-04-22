import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsEnum(['5', '8', '11'])
  type: '5' | '8' | '11';

  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  location: string;

  @IsNumber()
  maxPlayers: number;
  
  @IsNumber()
  duration?: number;
}
