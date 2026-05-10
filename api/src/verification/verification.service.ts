import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ApproveVerificationDto } from './dto/approve-verification.dto';
import { AccessType, AccessRequestStatus, AuditAction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '../utils/encryption.util';
import { retrieveEncryptedDocument } from '../utils/file-storage.util';
import { normalizePhoneNumber } from '../utils/phone.util';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notification: NotificationService,
    ) { }

    async requestVerification(orgId: string, dto: RequestVerificationDto) {
        const phone = normalizePhoneNumber(dto.phone);
        const { documentType, accessType, purpose, fields } = dto;

        // 1. Find user by phone
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            throw new NotFoundException('User with this phone number not found');
        }

        // 2. Create AccessRequest
        const request = await this.prisma.accessRequest.create({
            data: {
                organizationId: orgId,
                userId: user.id,
                documentType,
                accessType,
                accessPurpose: purpose,
                requestedFields: fields || [],
                status: 'PENDING',
            },
            include: {
                organization: {
                    select: { name: true },
                },
            },
        });

        // 3. Notify User in real-time
        await this.notification.notify(user.id, 'verification_request', {
            title: 'Identification Request',
            message: `${request.organization.name} is requesting access to your ${documentType}.`,
            payload: {
                requestId: request.id,
                orgName: request.organization.name,
                accessType,
                purpose,
                fields: fields || [],
                documentType,
            },
        });

        return {
            message: 'Verification request sent successfully',
            requestId: request.id,
        };
    }

    async approveVerification(userId: string, dto: ApproveVerificationDto) {
        const { requestId, documentId } = dto;

        // 1. Get request and verify ownership
        const request = await this.prisma.accessRequest.findUnique({
            where: { id: requestId },
            include: { organization: true },
        });

        if (!request) {
            throw new NotFoundException('Verification request not found');
        }

        if (request.userId !== userId) {
            throw new ForbiddenException('You are not authorized to approve this request');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException(`Request is already ${request.status.toLowerCase()}`);
        }

        // 2. Verify document ownership
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document || document.userId !== userId) {
            throw new NotFoundException('Document not found or access denied');
        }

        // 3. Create PermissionGrant
        const expiryMinutes = parseInt(process.env.ONE_TIME_REQUEST_SESSION_EXPIRED_TIME || '5', 10);
        const expiresAt = request.accessType === 'FULL_DOCUMENT'
            ? new Date(Date.now() + expiryMinutes * 5 * 1000)
            : null;

        const grant = await this.prisma.permissionGrant.create({
            data: {
                accessRequestId: request.id,
                userId: userId,
                organizationId: request.organizationId,
                documentId: documentId,
                accessType: request.accessType,
                allowedFields: request.requestedFields,
                status: 'ACTIVE',
                expiresAt,
            },
        });

        // 4. Update AccessRequest status
        await this.prisma.accessRequest.update({
            where: { id: requestId },
            data: { status: 'APPROVED' },
        });

        // 5. Create Audit Log
        await this.prisma.auditLog.create({
            data: {
                permissionGrantId: grant.id,
                action: 'GRANT_CREATED',
            },
        });

        // 6. Notify Organization in real-time
        await this.notification.notify(request.organizationId, 'verification_approved', {
            title: 'Verification Approved',
            message: `User has approved your ${request.accessType === 'FIELDS_ONLY' ? 'KYC' : 'One-Time'} request.`,
            payload: {
                requestId: request.id,
                grantId: grant.id,
                accessType: request.accessType,
            },
        }, 'org');

        return { message: 'Verification approved successfully', grantId: grant.id };
    }

    async denyVerification(userId: string, requestId: string) {
        const request = await this.prisma.accessRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.userId !== userId) {
            throw new NotFoundException('Request not found');
        }

        await this.prisma.accessRequest.update({
            where: { id: requestId },
            data: { status: 'DENIED' },
        });

        // Notify Organization
        await this.notification.notify(request.organizationId, 'verification_denied', {
            title: 'Request Denied',
            message: `User has denied your ${request.accessType === 'FIELDS_ONLY' ? 'KYC' : 'One-Time'} request.`,
            payload: { requestId },
        }, 'org');

        return { message: 'Verification denied' };
    }

    async getHistory(entityId: string, role: 'USER' | 'ORG') {
        if (role === 'ORG') {
            return this.prisma.accessRequest.findMany({
                where: { organizationId: entityId },
                include: {
                    user: {
                        select: { phone: true },
                    },
                    permissionGrant: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            return this.prisma.permissionGrant.findMany({
                where: { userId: entityId },
                include: {
                    organization: {
                        select: { name: true },
                    },
                    document: {
                        select: { type: true },
                    },
                },
                orderBy: { grantedAt: 'desc' },
            });
        }
    }

    async getPendingRequests(userId: string) {
        return this.prisma.accessRequest.findMany({
            where: {
                userId,
                status: 'PENDING',
            },
            include: {
                organization: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async revokeGrant(userId: string, grantId: string) {
        const grant = await this.prisma.permissionGrant.findUnique({
            where: { id: grantId },
        });

        if (!grant || grant.userId !== userId) {
            throw new NotFoundException('Grant not found');
        }

        await this.prisma.permissionGrant.update({
            where: { id: grantId },
            data: {
                status: 'REVOKED',
                revokedAt: new Date(),
            },
        });

        await this.prisma.auditLog.create({
            data: {
                permissionGrantId: grantId,
                action: 'GRANT_REVOKED',
            },
        });

        // Notify Organization in real-time
        await this.notification.notify(grant.organizationId, 'grant_revoked', {
            title: 'Access Revoked',
            message: 'A user has revoked your permission to view their data.',
            payload: {
                grantId: grant.id,
                requestId: grant.accessRequestId,
            },
        }, 'org');

        return { message: 'Permission revoked successfully' };
    }

    async getUserAuditLogs(userId: string) {
        return this.prisma.auditLog.findMany({
            where: {
                permissionGrant: {
                    userId: userId,
                },
            },
            include: {
                permissionGrant: {
                    include: {
                        organization: {
                            select: { name: true },
                        },
                        document: {
                            select: { type: true },
                        },
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
    }

    async getGrantData(orgId: string, grantId: string) {
        const grant = await this.prisma.permissionGrant.findUnique({
            where: { id: grantId },
            include: {
                document: {
                    include: {
                        documentFields: true,
                    },
                },
                organization: {
                    select: { name: true },
                },
            },
        });

        if (!grant) {
            throw new NotFoundException('Grant not found');
        }

        if (grant.organizationId !== orgId) {
            throw new ForbiddenException('You are not authorized to access this grant');
        }

        if (grant.status !== 'ACTIVE') {
            throw new BadRequestException(`Grant is ${grant.status.toLowerCase()}`);
        }

        if (grant.expiresAt && grant.expiresAt < new Date()) {
            // Update status to EXPIRED
            await this.prisma.permissionGrant.update({
                where: { id: grantId },
                data: { status: 'EXPIRED' },
            });
            throw new BadRequestException('Grant has expired');
        }

        // Create Audit Log for access
        await this.prisma.auditLog.create({
            data: {
                permissionGrantId: grantId,
                action: 'DATA_ACCESSED',
            },
        });

        // Filter fields based on allowedFields if it's FIELDS_ONLY
        if (grant.accessType === 'FIELDS_ONLY') {
            const fieldKeys = grant.allowedFields;
            const filteredFields = grant.document.documentFields
                .filter(f => fieldKeys.includes(f.fieldKey))
                .map(f => ({
                    ...f,
                    fieldValue: decrypt(f.fieldValueEncrypted),
                }));

            const { encryptedFilePath, ...docInfo } = grant.document;
            return {
                ...docInfo,
                documentFields: filteredFields,
                accessType: grant.accessType,
            };
        } else {
            // FULL_DOCUMENT - return document with decrypted fields and image
            const decryptedFields = grant.document.documentFields.map(f => ({
                ...f,
                fieldValue: decrypt(f.fieldValueEncrypted),
            }));

            const { encryptedFilePath, ...docInfo } = grant.document;

            let image: string | null = null;
            if (encryptedFilePath) {
                try {
                    image = await retrieveEncryptedDocument(encryptedFilePath);
                } catch (err) {
                    this.logger.error(`Failed to retrieve image for grant ${grantId}: ${err.message}`);
                }
            }

            return {
                ...docInfo,
                image,
                documentFields: decryptedFields,
                accessType: grant.accessType,
            };
        }
    }
}
