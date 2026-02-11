import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: 'notifications',
})
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('NotificationGateway');

    constructor(private readonly jwtService: JwtService) { }

    afterInit(server: Server) {
        this.logger.log('Notification Gateway Initialized');
    }

    async handleConnection(client: Socket) {
        try {
            // 1. Try to get token from handshake auth, query, or cookies
            let token = client.handshake.auth?.token || client.handshake.query?.token;

            if (!token && client.handshake.headers.cookie) {
                const cookies = client.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split('=');
                    acc[key] = value;
                    return acc;
                }, {});
                token = cookies['access_token'] || cookies['socket_token'];
            }

            if (!token) {
                this.logger.debug(`Client ${client.id} disconnected: No token provided in auth, query, or cookies`);
                client.disconnect();
                return;
            }

            // 2. Verify token
            const payload = await this.jwtService.verifyAsync(token as string).catch(err => {
                this.logger.debug(`Token verification failed for client ${client.id}: ${err.message}`);
                throw err;
            });

            const userId = payload.sub;

            // 3. Join room
            client.join(`user_${userId}`);
            this.logger.debug(`Client ${client.id} connected as user ${userId}`);
        } catch (error) {
            this.logger.debug(`Client ${client.id} authentication failed: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client ${client.id} disconnected`);
    }

    /**
     * Send a notification to a specific user via WebSocket
     */
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
        this.logger.debug(`Event ${event} sent to user_${userId}`);
    }

    /**
     * Broadcast a notification to all connected clients
     */
    broadcast(event: string, data: any) {
        this.server.emit(event, data);
    }
}
