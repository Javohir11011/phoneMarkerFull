import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: PrismaService) {}

  @Post()
  async create(@Body() createUserDto: Prisma.usersCreateManyInput) {
    const newUser = await this.usersService.users.create({
      data: createUserDto,
    });
    return newUser;
  }
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const users = await this.usersService.users.findMany({
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
    });
    return { users };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const users = await this.usersService.users.findUnique({
      where: { id },
    });
    if (!users) {
      throw new NotFoundException('User not found');
    }
    return users;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.usersUpdateInput,
  ) {
    const updatedUser = await this.usersService.users.update({
      where: { id },
      data: updateUserDto,
    });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedUser = await this.usersService.users.delete({
      where: { id },
    });
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted' };
  }
}
