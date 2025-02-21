import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: 'IPhone X' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 299.99 })
  price: number;

  @IsString()
  @ApiProperty({ example: '256/4 GB Apple Bionic A15 LL/A' })
  info: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  isActive: boolean;

  @IsNumber()
  @ApiProperty({ example: 4 })
  quantity: number;
}
