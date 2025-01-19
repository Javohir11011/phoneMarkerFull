import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async create(createProductDto: Prisma.ProductCreateInput) {
    const newProduct = await this.prisma.product.create({
      data: createProductDto,
    });
    await this.redis.set(newProduct.id, JSON.stringify(newProduct), 'EX', 3600); // Set TTL for 1 hour
    return {
      message: 'Product successfully added',
      productId: newProduct.id,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany();
    return products;
  }

  async findOne(id: string) {
    const getProduct = await this.prisma.product.findUnique({ where: { id } });
    return {
      message: 'One Product',
      product: getProduct,
    };
  }

  async update(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      message: 'Product updated successfully',
      productId: id,
      product,
    };
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });

    return {
      message: 'Product deleted successfully',
      productId: id,
    };
  }
}
