import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createUserDto: Prisma.usersCreateInput) {
    const newUser = await this.prisma.users.create({ data: createUserDto });
    await this.redis.set(newUser.email, JSON.stringify(newUser));
    return newUser;
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5 } = paginationDto;
    const [data, total] = await this.prisma.users.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      limit,
      page,
    };
  }
  async findByEmail(email: string) {
    const users = await this.redis.get(email);
    if (users) {
      return JSON.parse(users);
    }
    const findUser = await this.prisma.users.findUnique({ where: { email } });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    await this.redis.set(email, JSON.stringify(findUser));
    return findUser;
  }
  async update(id: string, updateUserDto: Prisma.usersUpdateInput) {
    const getUser = await this.prisma.users.findFirst({ where: { id: id } });
    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.users.update({ where: { id: id }, data: updateUserDto });
    await this.redis.set(id, JSON.stringify({ ...getUser, ...updateUserDto }));
    return {
      message: 'Updated',
      user_id: id,
    };
  }
  async activateUser(email: string) {
    const findUser = await this.prisma.users.findFirst({ where: { email } });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.users.update({
      where: { email: email },
      data: { is_active: true },
    });
    await this.redis.set(
      email,
      JSON.stringify({ ...findUser, is_active: true }),
    );
    return {
      message: 'User account activated successfully',
    };
  }
  async updatePassword(email: string, password: string) {
    const findUser = await this.prisma.users.findFirst({ where: { email } });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.users.update({
      where: { email: email },
      data: { password },
    });
    return {
      message: 'Password updated successfully',
    };
  }
  async remove(id: string) {
    const findUser = await this.prisma.users.findFirst({ where: { id: id } });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.users.delete({ where: { id: id } });
    await this.redis.del(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
