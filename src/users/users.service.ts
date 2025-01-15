import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';
import { FilterDto } from 'src/constants/paginationDto/filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createUserDto: SignUpAuthDto) {
    const newUser = await this.userRepository.save(createUserDto);
    await this.redis.set(newUser.id, JSON.stringify(newUser));
    return newUser;
  }
  async findAll(
    paginationDto: PaginationDto,
    searchDto: SearchDto,
    filterDto: FilterDto,
  ) {
    const { page = 1, limit = 5 } = paginationDto;
    const { search } = searchDto;
    const { category, priceMin, priceMax } = filterDto;

    const redisKey = `products:${page}:${limit}:${search || ''}:${category || ''}:${priceMin || ''}:${priceMax || ''}`;
    const cachedData = await this.redis.get(redisKey);
    if (cachedData) {
      console.log('Returning data from Redis');
      return JSON.parse(cachedData);
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder('users');

      if (search) {
        queryBuilder.where('users.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (category) {
        queryBuilder.andWhere('users.category = :category', {
          category,
        });
      }
      const [data, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (data.length === 0) {
        throw new NotFoundException('Users not found');
      }

      console.log('Storing data in Redis');
      await this.redis.set(
        redisKey,
        JSON.stringify({ data, total, page, limit }),
        'EX',
        3600,
      );

      return {
        data,
        total,
        page,
        limit,
      };
    }
  }

  async findOne(id: string) {
    const cachedData = await this.redis.get(id);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    await this.redis.set(findUser.id, JSON.stringify(findUser));
    return findUser;
  }
  async findByEmail(email: string) {
    const cachedData = await this.redis.get(email);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const findUserByEmail = await this.userRepository.findOneBy({ email });
    if (!findUserByEmail) {
      throw new NotFoundException('User not found');
    }
    await this.redis.set(
      findUserByEmail.email,
      JSON.stringify(findUserByEmail),
    );
    return findUserByEmail;
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const getUser = await this.userRepository.findOneBy({ id });
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update(id, updateUserDto);
    await this.redis.set(id, JSON.stringify({ ...getUser, ...updateUserDto }));
    return {
      message: 'Updated',
      user_id: getUser.id,
    };
  }
  async activateUser(email: string) {
    const findUser = await this.userRepository.findOneBy({ email });
    if (!findUser) {
      throw new NotFoundException('Data not found');
    }
    await this.userRepository.update({ email: email }, { isActive: true });
    await this.redis.set(
      email,
      JSON.stringify({ ...findUser, isActive: true }),
    );
    return {
      message: 'User Account activated',
    };
  }
  async saveToken(id: string, refreshToken: string) {
    await this.userRepository.update(id, { refresh_token: refreshToken });
    await this.redis.set(id, JSON.stringify({ refresh_token: refreshToken }));
  }
  async updatePassword(email: string, password: string) {
    await this.userRepository.update({ email: email }, { password: password });
    await this.redis.set(email, JSON.stringify({ password: password }));
    return {
      message: 'User password resetted successfully',
    };
  }
  async remove(id: string) {
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser) {
      throw new NotFoundException('User is not found');
    }
    await this.userRepository.delete(id);
    await this.redis.del(id);
    return {
      message: 'Deleted',
      user_id: findUser.id,
    };
  }
}
