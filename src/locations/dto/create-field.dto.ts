import { IsString, IsIn } from 'class-validator';

export class CreateFieldDto {
  @IsString()
  name: string;

  @IsIn(['5', '8', '11'])
  type: '5' | '8' | '11';
}