import { Test, TestingModule } from '@nestjs/testing';
import { TodoGateway } from './todo.gateway';
import { TodoService } from './todo.service';

describe('TodoGateway', () => {
  let gateway: TodoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoGateway, TodoService],
    }).compile();

    gateway = module.get<TodoGateway>(TodoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
