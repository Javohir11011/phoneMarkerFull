import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoGateway } from './todo.gateway';

@Module({
  providers: [TodoGateway, TodoService],
})
export class TodoModule {}
