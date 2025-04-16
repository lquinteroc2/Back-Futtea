import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  canchaName: string;

  @IsNotEmpty()
  comment: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
