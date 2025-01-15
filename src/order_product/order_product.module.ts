import { Module } from '@nestjs/common';
import { OrderProductService } from './order_product.service';
import { OrderProductController } from './order_product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProducts } from './entities/order_product.entity';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProducts]), PaginationDto],
  controllers: [OrderProductController],
  providers: [OrderProductService],
})
export class OrderProductModule {}
