import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

// Type definition for PrismaClient to avoid import errors
type PrismaClientType = any;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _client: PrismaClientType;

  constructor() {
    try {
      // Try to load PrismaClient at runtime
      const { PrismaClient } = require('@prisma/client');
      this._client = new PrismaClient();
      console.log('PrismaClient loaded successfully');
    } catch (error) {
      // Fallback if Prisma client not available
      console.error('Failed to load PrismaClient:', error);
      console.warn('Prisma client not available, using mock');
      this._client = {} as any;
    }
  }

  // Expose client directly for direct access
  get client() {
    return this._client;
  }

  async onModuleInit() {
    if (this._client && typeof this._client.$connect === 'function') {
      await this._client.$connect();
    }
  }

  async onModuleDestroy() {
    if (this._client && typeof this._client.$disconnect === 'function') {
      await this._client.$disconnect();
    }
  }

  // Proxy all Prisma model access
  get user() {
    return this._client?.user;
  }

  get organization() {
    return this._client?.organization;
  }

  get otp() {
    return this._client?.otp;
  }

  // Add other models as needed
  get document() {
    return this._client?.document;
  }

  get documentField() {
    return this._client?.documentField;
  }

  get accessRequest() {
    return this._client?.accessRequest;
  }

  get permissionGrant() {
    return this._client?.permissionGrant;
  }

  get accessLink() {
    return this._client?.accessLink;
  }

  get auditLog() {
    return this._client?.auditLog;
  }
}
