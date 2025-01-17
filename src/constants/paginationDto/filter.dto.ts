import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterDto {
  @IsOptional()
  category?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value, 10) : null))
  priceMin?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value, 10) : null))
  priceMax?: number;
}
