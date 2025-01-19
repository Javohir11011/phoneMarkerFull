import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly productService: PrismaService) {}
  async create(createProductDto: Prisma.productCreateInput) {
    return await this.productService.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    return await this.productService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    const product = await this.productService.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: Prisma.productUpdateInput) {
    const product = await this.productService.product.update({
      where: { id },
      data: updateProductDto,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async remove(id: string) {
    const product = await this.productService.product.delete({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product deleted successfully',
      productId: product.id,
    };
  }
}
