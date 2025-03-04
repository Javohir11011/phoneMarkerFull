import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailConfig } from '../configs/email';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    PaginationDto,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const emailConfig = EmailConfig(configService);
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            service: 'gmail',
            auth: {
              user: emailConfig.email,
              pass: emailConfig.pass,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
