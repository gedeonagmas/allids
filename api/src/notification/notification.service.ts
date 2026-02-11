import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
    private readonly logger = new Logger(NotificationService.name);
    private firebaseApp: admin.app.App | null = null;

    constructor(
        private readonly gateway: NotificationGateway,
        private readonly prisma: PrismaService,
    ) { }

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        try {
            if (process.env.FIREBASE_PROJECT_ID) {
                // If we have specific service account env vars, use them
                if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
                    this.firebaseApp = admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId: process.env.FIREBASE_PROJECT_ID,
                            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                        }),
                    });
                    this.logger.log('Firebase Admin initialized with Service Account credentials');
                } else {
                    // Fallback to application default (GCP environment)
                    this.firebaseApp = admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                        projectId: process.env.FIREBASE_PROJECT_ID,
                    });
                    this.logger.log('Firebase Admin initialized with application default credentials');
                }
            } else {
                this.logger.warn('Firebase config missing (FIREBASE_PROJECT_ID), Push Notifications will be mocked');
            }
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin', error.stack);
        }
    }

    /**
     * Send a notification to a specific user or organization
     */
    async notify(userId: string, event: string, data: { title: string; message: string; payload?: any }, type: 'user' | 'admin' | 'org' = 'user') {
        // 1. Send via WebSocket (Real-time)
        this.gateway.sendToUser(userId, event, {
            ...data,
            timestamp: new Date().toISOString(),
        });

        // 2. Send via Push Notification (Firebase)
        if (this.firebaseApp) {
            try {
                let fcmToken: string | null = null;
                const prismaClient = (this.prisma as any).client || this.prisma;

                if (type === 'org') {
                    const org = await prismaClient.organization.findUnique({
                        where: { id: userId },
                        select: { fcmToken: true },
                    });
                    fcmToken = org?.fcmToken;
                } else {
                    const user = await prismaClient.user.findUnique({
                        where: { id: userId },
                        select: { fcmToken: true },
                    });
                    fcmToken = user?.fcmToken;
                }

                if (fcmToken) {
                    try {
                        await admin.messaging(this.firebaseApp).send({
                            token: fcmToken,
                            notification: {
                                title: data.title,
                                body: data.message,
                            },
                            data: {
                                event,
                                payload: JSON.stringify(data.payload || {}),
                            },
                        });
                        this.logger.debug(`Push notification sent to ${type} ${userId}`);
                    } catch (fcmError) {
                        this.logger.warn(`Firebase message failed (likely credentials issue): ${fcmError.message}`);
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to lookup token for ${type} ${userId}`, error.stack);
            }
        }
    }
}
