import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  role: 'USER' | 'ADMIN' | 'ORG';
  type: 'user' | 'admin' | 'org';
}

type UserSelect = {
  id: string;
  phone: string | null;
  status: 'VERIFIED' | 'UNVERIFIED' | 'FREEZ';
  role: 'USER' | 'ADMIN' | 'ORG';
};

type OrgSelect = {
  id: string;
  name: string;
  phone: string | null;
  username: string | null;
  organizationType: 'BANK' | 'EMBASSY' | 'TRAFFIC_AUTHORITY' | 'OTHER';
  role: 'USER' | 'ADMIN' | 'ORG';
};

type AdminSelect = {
  id: string;
  username: string | null;
  role: 'USER' | 'ADMIN' | 'ORG';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // Try to get token from cookies first
          let token: string | null = null;
          
          // Method 1: Direct access to parsed cookies (cookie-parser should have done this)
          if (request?.cookies?.['access_token']) {
            token = request.cookies['access_token'] as string;
          }
          // Method 2: Parse cookie header manually (fallback if cookie-parser didn't work)
          else if (request?.headers?.cookie) {
            const cookieHeader = request.headers.cookie;
            const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
              const parts = cookie.trim().split('=');
              if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                acc[key] = decodeURIComponent(value);
              }
              return acc;
            }, {});
            token = cookies['access_token'] || null;
          }
          
          // Method 3: Try Authorization header as fallback
          if (!token && request?.headers?.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
              token = authHeader.substring(7);
            }
          }
          
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, role, type } = payload;

    if (type === 'user') {
      // Type assertion to help IDE understand the Prisma query result
      const prismaClient = (this.prisma as any).client;
      if (!prismaClient || !prismaClient.user) {
        throw new UnauthorizedException('Database not initialized');
      }
      const user = await prismaClient.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          phone: true,
          status: true,
          role: true,
        },
      }) as UserSelect | null;

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        phone: user.phone,
        status: user.status,
        role: user.role,
        type: 'user' as const,
      };
    } else if (type === 'org') {
      // Type assertion to help IDE understand the Prisma query result
      const prismaClient = (this.prisma as any).client;
      if (!prismaClient || !prismaClient.organization) {
        throw new UnauthorizedException('Database not initialized');
      }
      const org = await prismaClient.organization.findUnique({
        where: { id: sub },
        select: {
          id: true,
          name: true,
          phone: true,
          username: true,
          organizationType: true,
          role: true,
        },
      }) as OrgSelect | null;

      if (!org) {
        throw new UnauthorizedException('Organization not found');
      }

      return {
        id: org.id,
        name: org.name,
        phone: org.phone,
        username: org.username,
        organizationType: org.organizationType,
        role: org.role,
        type: 'org' as const,
      };
    } else if (type === 'admin') {
      // For admin, you might have a separate admin table or use User with role ADMIN
      // For now, assuming admin is a User with role ADMIN
      // Type assertion to help IDE understand the Prisma query result
      const prismaClient = (this.prisma as any).client;
      if (!prismaClient || !prismaClient.user) {
        throw new UnauthorizedException('Database not initialized');
      }
      const admin = await prismaClient.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          username: true,
          role: true,
        },
      }) as AdminSelect | null;

      if (!admin || admin.role !== 'ADMIN') {
        throw new UnauthorizedException('Admin not found');
      }

      return {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        type: 'admin' as const,
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}

