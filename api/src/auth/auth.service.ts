import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterOrgDto } from './dto/register-org.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  // Internal method to send OTP
  private async sendOtpInternal(phone: string): Promise<string> {
    // Generate 6-digit OTP
    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    // Store OTP in database
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient || !prismaClient.otp) {
      console.error('PrismaClient not available for OTP creation');
      throw new Error('Database not initialized');
    }
    await prismaClient.otp.create({
      data: {
        phoneNumber: phone,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Store in Redis for quick validation (optional, for rate limiting)
    await this.redis.set(`otp:${phone}`, code, { EX: 600 }); // 10 minutes TTL

    // TODO: Send SMS via your SMS provider
    console.log(`OTP for ${phone}: ${code}`); // Remove in production

    return code;
  }

  // Request OTP for Users (handles both registration and login)
  async requestOtp(dto: SendOtpDto): Promise<{ message: string; isNewUser: boolean; otp: string }> {
    const { phone } = dto;

    // Check if user already exists
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient || !prismaClient.user) {
      console.error('PrismaClient not available for user operations');
      throw new Error('Database not initialized');
    }
    let user = await prismaClient.user.findUnique({
      where: { phone },
    });

    const isNewUser = !user;

    // If user doesn't exist, create a new user with UNVERIFIED status
    if (!user) {
      user = await prismaClient.user.create({
        data: {
          phone,
          status: 'UNVERIFIED',
          role: 'USER',
        },
      });
    } else {
      // If user exists, check if account is frozen
      if (user.status === 'FREEZ') {
        throw new UnauthorizedException('Account is frozen');
      }
    }

    // Send OTP internally and get the code
    const otpCode = await this.sendOtpInternal(phone);

    return {
      message: 'OTP sent successfully. Please verify to continue.',
      isNewUser,
      otp: otpCode,
    };
  }

  // Registration for Users (DEPRECATED - Use requestOtp instead)
  async register(dto: RegisterDto): Promise<{ message: string; isNewUser: boolean; otp: string }> {
    return this.requestOtp(dto);
  }

  // Login for Users (DEPRECATED - Use requestOtp instead)
  async userLogin(dto: UserLoginDto): Promise<{ message: string; otp: string }> {
    const result = await this.requestOtp(dto);
    return { message: result.message, otp: result.otp };
  }

  // OTP Methods for Users (Login/Registration) - DEPRECATED: Use register or userLogin instead
  // Keeping for backward compatibility but should not be used directly
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const { phone } = dto;
    await this.sendOtpInternal(phone);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ user: any; access_token: string }> {
    const { phone, code } = dto;

    // Find the most recent OTP for this phone
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient || !prismaClient.otp) {
      throw new BadRequestException('Database not initialized');
    }
    const otp = await prismaClient.otp.findFirst({
      where: {
        phoneNumber: phone,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Verify code
    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Mark OTP as consumed
    await prismaClient.otp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    // Find or create user
    let user = await prismaClient.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: {
          phone,
          status: 'UNVERIFIED',
          role: 'USER',
        },
      });
    } else if (user.status === 'FREEZ') {
      throw new UnauthorizedException('Account is frozen');
    }

    // Update user status to verified if it was unverified
    if (user.status === 'UNVERIFIED') {
      user = await prismaClient.user.update({
        where: { id: user.id },
        data: { status: 'VERIFIED' },
      });
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: 'user',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      access_token,
    };
  }

  // Username/Password Methods for Admin and Org
  async login(dto: LoginDto): Promise<{ user: any; access_token: string }> {
    const { username, password } = dto;

    // Try to find as organization first
    let org = await (this.prisma as any).client?.organization?.findUnique({
      where: { username },
    });

    if (org) {
      if (!org.passwordHash) {
        throw new UnauthorizedException('Password not set for this organization');
      }

      const isPasswordValid = await bcrypt.compare(password, org.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        sub: org.id,
        role: org.role,
        type: 'org',
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user: {
          id: org.id,
          name: org.name,
          role: org.role,
          organizationType: org.organizationType,
        },
        access_token,
      };
    }

    // Try to find as admin (User with role ADMIN)
    const admin = await (this.prisma as any).client?.user?.findFirst({
      where: {
        OR: [
          { username },
          { phone: username },
        ],
        role: 'ADMIN',
      },
    });

    if (admin) {
      if (!admin.passwordHash) {
        throw new UnauthorizedException('Password not set for this admin');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = {
        sub: admin.id,
        role: admin.role,
        type: 'admin',
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
        access_token,
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  // Registration for Organizations
  async registerOrg(dto: RegisterOrgDto): Promise<{ user: any; access_token: string }> {
    const { username, password, name, address, organizationType, contactEmail, allowedDocumentTypes } = dto;

    // Check if organization already exists
    const existingOrg = await (this.prisma as any).client?.organization?.findUnique({
      where: { username },
    });

    if (existingOrg) {
      throw new BadRequestException('Organization with this username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate API key hash (in production, generate a secure API key)
    const apiKey = `org_${username}_${Date.now()}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    // Create organization
    const org = await (this.prisma as any).client?.organization?.create({
      data: {
        name,
        address,
        organizationType,
        contactEmail,
        username,
        passwordHash,
        apiKeyHash,
        allowedDocumentTypes: allowedDocumentTypes || [],
        role: 'ORG',
      },
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: org.id,
      role: 'ORG',
      type: 'org',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: org.id,
        name: org.name,
        username: org.username,
        organizationType: org.organizationType,
        role: org.role,
      },
      access_token,
    };
  }

  // Registration for Admin
  async registerAdmin(dto: RegisterAdminDto): Promise<{ user: any; access_token: string }> {
    const { username, password } = dto;

    // Check if admin already exists
    const existingAdmin = await (this.prisma as any).client?.user?.findFirst({
      where: {
        username,
        role: 'ADMIN',
      },
    });

    if (existingAdmin) {
      throw new BadRequestException('Admin with this username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await (this.prisma as any).client?.user?.create({
      data: {
        username,
        passwordHash,
        role: 'ADMIN',
        status: 'VERIFIED',
      },
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: admin.id,
      role: 'ADMIN',
      type: 'admin',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      access_token,
    };
  }

  async validateUser(userId: string, role: 'USER' | 'ADMIN' | 'ORG', type: string) {
    if (type === 'user') {
      const user = await (this.prisma as any).client?.user?.findUnique({
        where: { id: userId },
      });
      if (!user || user.role !== role) {
        return null;
      }
      return user;
    } else if (type === 'org') {
      const org = await (this.prisma as any).client?.organization?.findUnique({
        where: { id: userId },
      });
      if (!org || org.role !== role) {
        return null;
      }
      return org;
    }
    return null;
  }
}

