import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';
import { FilterDto } from 'src/constants/paginationDto/filter.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productRepository.create({
      ...createProductDto,
    });
    await this.redis.set(newProduct.id, JSON.stringify(newProduct));
    await this.productRepository.save(newProduct);
    return {
      message: 'Product successfully added',
      productId: newProduct.id,
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
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      if (search) {
        queryBuilder.where('product.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      if (category) {
        queryBuilder.andWhere('product.category = :category', {
          category,
        });
      }

      if (priceMin) {
        queryBuilder.andWhere('product.price >= :priceMin', {
          priceMin,
        });
      }

      if (priceMax) {
        queryBuilder.andWhere('product.price <= :priceMax', {
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
    const redisData = await this.redis.get(id);
    if (redisData) {
      return {
        message: 'One Product',
        product: JSON.parse(redisData),
      };
    }
    const getProduct = await this.productRepository.findOneBy({ id });
    if (getProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.redis.set(id, JSON.stringify(getProduct));
    return {
      message: 'One Product',
      product: getProduct,
    };
  }
  async update(id: string, updateProductDto: UpdateProductDto) {
    const getData = await this.productRepository.findOneBy({ id });
    if (!getData) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.update(id, updateProductDto);
    await this.redis.set(
      id,
      JSON.stringify({ ...getData, ...updateProductDto }),
    );
    return {
      message: 'Product updated',
      productId: getData.id,
    };
  }
  async remove(id: string) {
    const getData = await this.productRepository.findOneBy({ id });
    if (!getData) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(id);
    await this.redis.del(id);
    return {
      message: 'Product deleted',
      productId: getData.id,
    };
  }
}
