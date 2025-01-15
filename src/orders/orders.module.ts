import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Orders]), PaginationDto],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
