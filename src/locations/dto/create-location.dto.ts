import { IsString, IsOptional, IsObject } from 'class-validator';
import { Point } from 'geojson';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsObject()
  coordinates?: Point;
}
