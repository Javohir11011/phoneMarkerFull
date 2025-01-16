import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@WebSocketGateway()
export class TodoGateway {
  constructor(private readonly todoService: TodoService) {}

  @SubscribeMessage('createTodo')
  create(@MessageBody() createTodoDto: CreateTodoDto) {
    return {
      data: 'Data',
      status: 'ok',
      createTodoDto,
    };

    // return this.todoService.create(createTodoDto);
  }

  @SubscribeMessage('findAllTodo')
  findAll() {
    return this.todoService.findAll();
  }

  @SubscribeMessage('findOneTodo')
  findOne(@MessageBody() id: number) {
    return this.todoService.findOne(id);
  }

  @SubscribeMessage('updateTodo')
  update(@MessageBody() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(updateTodoDto.id, updateTodoDto);
  }

  @SubscribeMessage('removeTodo')
  remove(@MessageBody() id: number) {
    return this.todoService.remove(id);
  }
}
