import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './ProductsController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { SearchDto } from 'src/constants/paginationDto/search.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Products]), PaginationDto, SearchDto],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
