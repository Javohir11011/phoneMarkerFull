import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Products]), PaginationDto],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
