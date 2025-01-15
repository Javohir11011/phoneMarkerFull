import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';
import { FilterDto } from 'src/constants/paginationDto/filter.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private orderRepository: Repository<Orders>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderRepository.create({ ...createOrderDto });
    await this.redis.set(newOrder.id, JSON.stringify(newOrder));
    await this.orderRepository.save(newOrder);
    return {
      message: 'New Order created',
      orderId: newOrder.id,
    };
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
      const queryBuilder = this.orderRepository.createQueryBuilder('orders');

      if (search) {
        queryBuilder.where('order.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (category) {
        queryBuilder.andWhere('order.category = :category', {
          category,
        });
      }

      if (priceMin) {
        queryBuilder.andWhere('order.price >= :priceMin', {
          priceMin,
        });
      }

      if (priceMax) {
        queryBuilder.andWhere('order.price <= :priceMax', {
          priceMax,
        });
      }
      const [data, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (data.length === 0) {
        throw new NotFoundException('Products not found');
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
      return {
        message: 'One Order',
        order: JSON.parse(cachedData),
      };
    }
    const getOrder = await this.orderRepository.findOneBy({ id });
    if (!getOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.redis.set(id, JSON.stringify(getOrder));
    return {
      message: 'One Order',
      order: getOrder,
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const findOrder = await this.orderRepository.findOneBy({ id });
    if (!findOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.update({ id: id }, { ...updateOrderDto });
    await this.redis.set(
      id,
      JSON.stringify({ ...findOrder, ...updateOrderDto }),
    );
    return {
      message: 'Order updated',
      orderId: findOrder.id,
    };
  }

  async remove(id: string) {
    const findOrder = await this.orderRepository.findOneBy({ id });
    if (!findOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.delete({ id: id });
    await this.redis.del(id);
    return {
      message: 'Order deleted',
      orderId: findOrder.id,
    };
  }
}
