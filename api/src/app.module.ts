import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationModule } from './notification/notification.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [UsersModule, RedisModule, PrismaModule, AuthModule, DocumentsModule, NotificationModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
