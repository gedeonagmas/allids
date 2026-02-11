import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
            signOptions: {
                expiresIn: '7d',
            },
        }),
        PrismaModule,
    ],
    providers: [NotificationGateway, NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }
