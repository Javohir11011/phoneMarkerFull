import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';
import { FilterDto } from 'src/constants/paginationDto/filter.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
    @Query() filterDto: FilterDto,
  ) {
    return await this.productsService.findAll(
      paginationDto,
      searchDto,
      filterDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
