import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, DocumentType } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = /(jpg|jpeg|png|webp)$/i;
        const fileExtension = file.originalname?.split('.').pop()?.toLowerCase() || '';
        const mimeType = file.mimetype || '';
        
        if (
          allowedTypes.test(fileExtension) ||
          mimeType.match(/image\/(jpeg|jpg|png|webp)/i)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed types: JPEG, PNG, WebP. Got: ${fileExtension || mimeType}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadDocument(
    @CurrentUser() user: any,
    @Req() req: Request,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required. Please ensure you are sending a file with the field name "image" as multipart/form-data.',
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Get type and isValid from request body (FileInterceptor processes multipart and puts text fields in req.body)
    const type = req.body?.type;
    const isValid = req.body?.isValid !== undefined 
      ? req.body.isValid === 'true' || req.body.isValid === true 
      : undefined;

    // Validate document type
    if (!type || !Object.values(DocumentType).includes(type as DocumentType)) {
      throw new BadRequestException(
        `Invalid document type. Must be one of: ${Object.values(DocumentType).join(', ')}. Received: ${type || 'undefined'}`,
      );
    }

    // Convert file to base64
    const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const uploadDto: UploadDocumentDto = {
      type: type as DocumentType,
      image: imageBase64,
      isValid: isValid, // Optional: For test mode only
    };

    return this.documentsService.uploadDocument(user.id, user.role, uploadDto);
  }

  @Post('upload-base64')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.CREATED)
  async uploadDocumentBase64(
    @CurrentUser() user: any,
    @Body() uploadDto: UploadDocumentDto,
  ) {
    return this.documentsService.uploadDocument(user.id, user.role, uploadDto);
  }

  @Get()
  @Roles(Role.USER)
  async getUserDocuments(@CurrentUser() user: any) {
    return this.documentsService.getUserDocuments(user.id, user.role);
  }

  @Get('wallet')
  @Roles(Role.USER)
  async getUserWallet(@CurrentUser() user: any) {
    return this.documentsService.getUserWallet(user.id, user.role);
  }

  @Get(':id')
  @Roles(Role.USER)
  async getDocument(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.getDocument(id, user.id, user.role);
  }

  @Put(':id/replace')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = /(jpg|jpeg|png|webp)$/i;
        const fileExtension = file.originalname?.split('.').pop()?.toLowerCase() || '';
        const mimeType = file.mimetype || '';
        
        if (
          allowedTypes.test(fileExtension) ||
          mimeType.match(/image\/(jpeg|jpg|png|webp)/i)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed types: JPEG, PNG, WebP. Got: ${fileExtension || mimeType}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async replaceDocument(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required. Please ensure you are sending a file with the field name "image" as multipart/form-data.',
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Get type and isValid from request body (FileInterceptor processes multipart and puts text fields in req.body)
    const type = req.body?.type;
    const isValid = req.body?.isValid !== undefined 
      ? req.body.isValid === 'true' || req.body.isValid === true 
      : undefined;

    // Validate document type
    if (!type || !Object.values(DocumentType).includes(type as DocumentType)) {
      throw new BadRequestException(
        `Invalid document type. Must be one of: ${Object.values(DocumentType).join(', ')}. Received: ${type || 'undefined'}`,
      );
    }

    // Convert file to base64
    const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const uploadDto: UploadDocumentDto = {
      type: type as DocumentType,
      image: imageBase64,
      isValid: isValid, // Optional: For test mode only
    };

    return this.documentsService.replaceDocument(id, user.id, user.role, uploadDto);
  }

  @Put(':id/replace-base64')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  async replaceDocumentBase64(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() uploadDto: UploadDocumentDto,
  ) {
    return this.documentsService.replaceDocument(id, user.id, user.role, uploadDto);
  }

  @Delete(':id')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  async deleteDocument(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.deleteDocument(id, user.id, user.role);
  }
}

