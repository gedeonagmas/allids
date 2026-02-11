import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: any) {
    if (!currentUser || !currentUser.id) {
      throw new BadRequestException('User information not available');
    }

    // Get the type from the current user (set by JWT strategy)
    const userType = currentUser.type || 'user';

    // Try to get fresh data from database based on type
    try {
      const profile = await this.usersService.getProfile(currentUser.id, userType);
      return profile;
    } catch (error) {
      // If NotFoundException, entity was deleted after token was issued
      // Return the data from JWT token as fallback
      if (error instanceof NotFoundException) {
        if (userType === 'org') {
          return {
            id: currentUser.id,
            name: currentUser.name,
            address: null,
            phone: currentUser.phone || null,
            username: currentUser.username || null,
            organizationType: currentUser.organizationType,
            contactEmail: null,
            allowedDocumentTypes: [],
            role: currentUser.role,
            createdAt: null,
            updatedAt: null,
          };
        } else if (userType === 'admin') {
          // admin - no phone
          return {
            id: currentUser.id,
            username: currentUser.username || null,
            status: currentUser.status || null,
            role: currentUser.role,
            createdAt: null,
            updatedAt: null,
          };
        } else {
          // user - no username
          return {
            id: currentUser.id,
            phone: currentUser.phone || null,
            status: currentUser.status || null,
            role: currentUser.role,
            createdAt: null,
            updatedAt: null,
          };
        }
      }
      throw error;
    }
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(@CurrentUser() currentUser: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userType = currentUser.type || 'user';
    return this.usersService.updateProfile(currentUser.id, updateProfileDto, userType);
  }

  @Patch('fcm-token')
  @HttpCode(HttpStatus.OK)
  updateFcmToken(@CurrentUser() currentUser: any, @Body('token') token: string) {
    const userType = currentUser.type || 'user';
    return this.usersService.updateFcmToken(currentUser.id, token, userType);
  }

  @Get(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@CurrentUser() admin: any, @Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateUserProfile(admin.id, id, updateProfileDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
