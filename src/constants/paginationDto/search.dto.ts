import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({
    example: 'John',
    description: 'Search term to filter users by fullname or email',
  })
  search: string;
}
