import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return (this.prisma as any).client?.user?.create({ data: createUserDto });
  }

  findAll() {
    return (this.prisma as any).client?.user?.findMany();
  }

  async findOne(id: string) {
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient || !prismaClient.user) {
      throw new BadRequestException('Database not initialized');
    }

    const user = await prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove username for regular users (role USER)
    if (user.role === 'USER') {
      const { username, ...userWithoutUsername } = user;
      return userWithoutUsername;
    }

    // Remove phone for admins (role ADMIN)
    if (user.role === 'ADMIN') {
      const { phone, ...adminWithoutPhone } = user;
      return adminWithoutPhone;
    }

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return (this.prisma as any).client?.user?.update({ where: { id }, data: updateUserDto });
  }

  remove(id: string) {
    return (this.prisma as any).client?.user?.delete({ where: { id } });
  }

  // Update own profile (for users, admins, and orgs)
  async updateProfile(entityId: string, updateProfileDto: UpdateProfileDto, type: 'user' | 'admin' | 'org') {
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient) {
      throw new BadRequestException('Database not initialized');
    }

    if (type === 'org') {
      // Handle organization profile update
      if (!prismaClient.organization) {
        throw new BadRequestException('Database not initialized');
      }

      // Check if organization exists
      const org = await prismaClient.organization.findUnique({
        where: { id: entityId },
      });

      if (!org) {
        throw new NotFoundException('Organization not found');
      }

      // Check for duplicate username if updating username
      if (updateProfileDto.username && updateProfileDto.username !== org.username) {
        // Check in both user and organization tables
        const existingUser = await prismaClient.user.findUnique({
          where: { username: updateProfileDto.username },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { username: updateProfileDto.username },
        });

        if ((existingUser || (existingOrg && existingOrg.id !== entityId))) {
          throw new BadRequestException('Username already taken');
        }
      }

      // Check for duplicate phone if updating phone
      if (updateProfileDto.phone && updateProfileDto.phone !== org.phone) {
        // Check in both user and organization tables
        const existingUser = await prismaClient.user.findUnique({
          where: { phone: updateProfileDto.phone },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { phone: updateProfileDto.phone },
        });

        if ((existingUser || (existingOrg && existingOrg.id !== entityId))) {
          throw new BadRequestException('Phone number already taken');
        }
      }

      // Update organization profile
      const updatedOrg = await prismaClient.organization.update({
        where: { id: entityId },
        data: {
          ...(updateProfileDto.username !== undefined && { username: updateProfileDto.username }),
          ...(updateProfileDto.phone !== undefined && { phone: updateProfileDto.phone }),
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          username: true,
          organizationType: true,
          contactEmail: true,
          allowedDocumentTypes: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedOrg;
    } else {
      // Handle user/admin profile update (both are in user table)
      if (!prismaClient.user) {
        throw new BadRequestException('Database not initialized');
      }

      // Check if user exists
      const user = await prismaClient.user.findUnique({
        where: { id: entityId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check for duplicate username if updating username
      if (updateProfileDto.username && updateProfileDto.username !== user.username) {
        // Check in both user and organization tables
        const existingUser = await prismaClient.user.findUnique({
          where: { username: updateProfileDto.username },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { username: updateProfileDto.username },
        });

        if ((existingUser && existingUser.id !== entityId) || existingOrg) {
          throw new BadRequestException('Username already taken');
        }
      }

      // Check for duplicate phone if updating phone (only for users, not admins)
      if (updateProfileDto.phone && updateProfileDto.phone !== user.phone && type === 'user') {
        // Check in both user and organization tables
        const existingUser = await prismaClient.user.findUnique({
          where: { phone: updateProfileDto.phone },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { phone: updateProfileDto.phone },
        });

        if ((existingUser && existingUser.id !== entityId) || existingOrg) {
          throw new BadRequestException('Phone number already taken');
        }
      }

      // Update user profile
      const updateData: any = {};
      if (type === 'user') {
        // Users can update phone but not username
        if (updateProfileDto.phone !== undefined) {
          updateData.phone = updateProfileDto.phone;
        }
      } else if (type === 'admin') {
        // Admins can update username but not phone
        if (updateProfileDto.username !== undefined) {
          updateData.username = updateProfileDto.username;
        }
      }

      const updatedUser = await prismaClient.user.update({
        where: { id: entityId },
        data: updateData,
        select: {
          id: true,
          phone: true,
          username: true,
          status: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Remove fields based on type
      if (updatedUser.role === 'USER') {
        const { username, ...userWithoutUsername } = updatedUser;
        return userWithoutUsername;
      } else if (updatedUser.role === 'ADMIN') {
        const { phone, ...adminWithoutPhone } = updatedUser;
        return adminWithoutPhone;
      }

      return updatedUser;
    }
  }

  // Get organization profile
  async findOrganization(id: string) {
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient || !prismaClient.organization) {
      throw new BadRequestException('Database not initialized');
    }

    const org = await prismaClient.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        username: true,
        organizationType: true,
        contactEmail: true,
        allowedDocumentTypes: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  // Get profile based on type (user, admin, org)
  async getProfile(id: string, type: 'user' | 'admin' | 'org') {
    if (type === 'org') {
      return this.findOrganization(id);
    } else {
      // Both user and admin are in the User table
      return this.findOne(id);
    }
  }

  // Update any user/organization profile (for admins)
  async updateUserProfile(adminId: string, entityId: string, updateProfileDto: UpdateProfileDto) {
    const prismaClient = (this.prisma as any).client;
    if (!prismaClient) {
      throw new BadRequestException('Database not initialized');
    }

    // Verify admin exists and has ADMIN role
    const admin = await prismaClient.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update other users');
    }

    // First, try to find in user table
    let user = await prismaClient.user.findUnique({
      where: { id: entityId },
    });

    if (user) {
      // It's a user or admin - update user table
      // Check for duplicate username if updating username
      if (updateProfileDto.username && updateProfileDto.username !== user.username) {
        const existingUser = await prismaClient.user.findUnique({
          where: { username: updateProfileDto.username },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { username: updateProfileDto.username },
        });

        if ((existingUser && existingUser.id !== entityId) || existingOrg) {
          throw new BadRequestException('Username already taken');
        }
      }

      // Check for duplicate phone if updating phone (only for users, not admins)
      if (updateProfileDto.phone && updateProfileDto.phone !== user.phone && user.role === 'USER') {
        const existingUser = await prismaClient.user.findUnique({
          where: { phone: updateProfileDto.phone },
        });
        const existingOrg = await prismaClient.organization.findUnique({
          where: { phone: updateProfileDto.phone },
        });

        if ((existingUser && existingUser.id !== entityId) || existingOrg) {
          throw new BadRequestException('Phone number already taken');
        }
      }

      // Update user profile
      const updateData: any = {};
      if (user.role === 'USER') {
        // Users can update phone but not username
        if (updateProfileDto.phone !== undefined) {
          updateData.phone = updateProfileDto.phone;
        }
      } else if (user.role === 'ADMIN') {
        // Admins can update username but not phone
        if (updateProfileDto.username !== undefined) {
          updateData.username = updateProfileDto.username;
        }
      }

      const updatedUser = await prismaClient.user.update({
        where: { id: entityId },
        data: updateData,
        select: {
          id: true,
          phone: true,
          username: true,
          status: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Remove fields based on role
      if (updatedUser.role === 'USER') {
        const { username, ...userWithoutUsername } = updatedUser;
        return userWithoutUsername;
      } else if (updatedUser.role === 'ADMIN') {
        const { phone, ...adminWithoutPhone } = updatedUser;
        return adminWithoutPhone;
      }

      return updatedUser;
    }

    // If not found in user table, try organization table
    if (!prismaClient.organization) {
      throw new BadRequestException('Database not initialized');
    }

    const org = await prismaClient.organization.findUnique({
      where: { id: entityId },
    });

    if (!org) {
      throw new NotFoundException('User or organization not found');
    }

    // It's an organization - update organization table
    // Check for duplicate username if updating username
    if (updateProfileDto.username && updateProfileDto.username !== org.username) {
      const existingUser = await prismaClient.user.findUnique({
        where: { username: updateProfileDto.username },
      });
      const existingOrg = await prismaClient.organization.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existingUser || (existingOrg && existingOrg.id !== entityId)) {
        throw new BadRequestException('Username already taken');
      }
    }

    // Check for duplicate phone if updating phone
    if (updateProfileDto.phone && updateProfileDto.phone !== org.phone) {
      const existingUser = await prismaClient.user.findUnique({
        where: { phone: updateProfileDto.phone },
      });
      const existingOrg = await prismaClient.organization.findUnique({
        where: { phone: updateProfileDto.phone },
      });

      if (existingUser || (existingOrg && existingOrg.id !== entityId)) {
        throw new BadRequestException('Phone number already taken');
      }
    }

    // Update organization profile
    const updatedOrg = await prismaClient.organization.update({
      where: { id: entityId },
      data: {
        ...(updateProfileDto.username !== undefined && { username: updateProfileDto.username }),
        ...(updateProfileDto.phone !== undefined && { phone: updateProfileDto.phone }),
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        username: true,
        organizationType: true,
        contactEmail: true,
        allowedDocumentTypes: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedOrg;
  }
}
