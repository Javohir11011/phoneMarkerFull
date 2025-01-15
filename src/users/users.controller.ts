import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';
import { FilterDto } from 'src/constants/paginationDto/filter.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: SignUpAuthDto) {
    return await this.usersService.create(createUserDto);
  }
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
    @Query() filterDto: FilterDto,
  ) {
    return await this.usersService.findAll(paginationDto, searchDto, filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
