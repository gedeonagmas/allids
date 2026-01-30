import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegulaService, RegulaVerificationResult } from '../regula/regula.service';
import { DocumentType, DocumentStatus, Role } from '@prisma/client';
import { encrypt } from '../utils/encryption.util';
import { storeEncryptedDocument, deleteEncryptedDocument } from '../utils/file-storage.util';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regulaService: RegulaService,
  ) {}

  /**
   * Check if user has an existing verified document of the same type that hasn't expired
   */
  private async checkExistingValidDocument(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ exists: boolean; document: any | null }> {
    const now = new Date();

    // Find verified documents of the same type for this user
    const existingDocuments = await (this.prisma as any).document.findMany({
      where: {
        userId,
        type: documentType,
        status: DocumentStatus.VERIFIED,
      },
      orderBy: { createdAt: 'desc' }, // Get most recent first
    });

    // Check if any verified document is still valid (not expired)
    for (const doc of existingDocuments) {
      // If expiredDate is null, consider it as never expiring (valid)
      if (!doc.expiredDate) {
        return { exists: true, document: doc };
      }

      // If expiredDate is in the future, document is still valid
      if (new Date(doc.expiredDate) > now) {
        return { exists: true, document: doc };
      }
    }

    // No valid verified document found
    return { exists: false, document: null };
  }

  /**
   * Upload and verify a document
   */
  async uploadDocument(
    userId: string,
    userRole: Role,
    uploadDto: UploadDocumentDto,
  ) {
    // Verify user has USER role
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can upload documents');
    }

    // Verify user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for existing valid verified document of the same type
    const existingDocCheck = await this.checkExistingValidDocument(
      userId,
      uploadDto.type,
    );

    if (existingDocCheck.exists && existingDocCheck.document) {
      const existingDoc = existingDocCheck.document;
      const expiredDate = existingDoc.expiredDate
        ? new Date(existingDoc.expiredDate).toLocaleDateString()
        : 'never';
      
      throw new BadRequestException(
        `You already have a verified ${uploadDto.type} document that is still valid. ` +
          `Existing document ID: ${existingDoc.id}, expires: ${expiredDate}. ` +
          `Please wait until the current document expires before uploading a new one.`,
      );
    }

    // Validate image format
    this.validateImageFormat(uploadDto.image);

    try {
      // Verify document with Regula
      // Pass isValid from DTO (only used in test mode)
      this.logger.log(`Verifying ${uploadDto.type} document for user ${userId}`);
      const verificationResult = await this.regulaService.verifyDocument(
        uploadDto.image,
        uploadDto.type,
        uploadDto.isValid, // Optional: For test mode only
      );

      // Create document record
      const document = await (this.prisma as any).document.create({
        data: {
          userId,
          type: uploadDto.type,
          status:
            verificationResult.status === 'success'
              ? DocumentStatus.VERIFIED
              : DocumentStatus.REJECTED,
          issuerCountry: this.extractIssuerCountry(verificationResult),
          expiredDate: this.extractExpiryDate(verificationResult),
          encryptedFilePath: '', // Will be updated after file storage
        },
      });

      // Store encrypted document file
      const filePath = await storeEncryptedDocument(document.id, uploadDto.image);
      
      // Update document with file path
      await (this.prisma as any).document.update({
        where: { id: document.id },
        data: { encryptedFilePath: filePath },
      });

      // If verification successful, store extracted fields
      let storedFields: any[] = [];
      if (verificationResult.status === 'success' && verificationResult.fields.length > 0) {
        await this.storeDocumentFields(document.id, verificationResult.fields);
        
        // Fetch stored fields to return in response
        storedFields = await (this.prisma as any).documentField.findMany({
          where: { documentId: document.id },
          select: {
            id: true,
            fieldKey: true,
            // Note: fieldValueEncrypted is not returned for security
          },
          orderBy: { fieldKey: 'asc' },
        });
      }

      this.logger.log(
        `Document ${document.id} uploaded and ${verificationResult.status === 'success' ? 'verified' : 'rejected'}`,
      );

      return {
        id: document.id,
        type: document.type,
        status: document.status,
        issuerCountry: document.issuerCountry,
        expiredDate: document.expiredDate,
        verificationStatus: verificationResult.status,
        fieldsExtracted: verificationResult.fields.length,
        fields: storedFields.map((f) => ({
          id: f.id,
          fieldKey: f.fieldKey,
        })),
        createdAt: document.createdAt,
      };
    } catch (error: any) {
      this.logger.error(`Error uploading document: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(userId: string, userRole: Role) {
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can view their documents');
    }

    const documents = await (this.prisma as any).document.findMany({
      where: { userId },
      include: {
        _count: {
          select: { documentFields: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      issuerCountry: doc.issuerCountry,
      expiredDate: doc.expiredDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      fieldsCount: doc._count.documentFields,
    }));
  }

  /**
   * Get user's wallet - returns only verified documents
   */
  async getUserWallet(userId: string, userRole: Role) {
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can view their wallet');
    }

    const documents = await (this.prisma as any).document.findMany({
      where: {
        userId,
        status: DocumentStatus.VERIFIED,
      },
      include: {
        documentFields: {
          select: {
            id: true,
            fieldKey: true,
            // Note: fieldValueEncrypted is not returned for security
          },
          orderBy: { fieldKey: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      issuerCountry: doc.issuerCountry,
      expiredDate: doc.expiredDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      fieldsCount: doc.documentFields.length,
      fields: doc.documentFields.map((f: any) => ({
        id: f.id,
        fieldKey: f.fieldKey,
      })),
    }));
  }

  /**
   * Get a specific document
   */
  async getDocument(documentId: string, userId: string, userRole: Role) {
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can view documents');
    }

    const document = await (this.prisma as any).document.findFirst({
      where: {
        id: documentId,
        userId, // Ensure user owns the document
      },
      include: {
        documentFields: {
          select: {
            id: true,
            fieldKey: true,
            // Note: fieldValueEncrypted is not returned for security
          },
          orderBy: { fieldKey: 'asc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      id: document.id,
      type: document.type,
      status: document.status,
      issuerCountry: document.issuerCountry,
      expiredDate: document.expiredDate,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      fieldsCount: document.documentFields.length,
      fields: document.documentFields.map((f: any) => ({
        id: f.id,
        fieldKey: f.fieldKey,
      })),
    };
  }

  /**
   * Store extracted document fields
   */
  private async storeDocumentFields(
    documentId: string,
    fields: RegulaVerificationResult['fields'],
  ) {
    const fieldPromises = fields.map((field) =>
      (this.prisma as any).documentField.create({
        data: {
          documentId,
          fieldKey: field.fieldName,
          fieldValueEncrypted: encrypt(field.value),
        },
      }).catch((error: any) => {
        // Handle unique constraint violation (field already exists)
        if (error.code === 'P2002') {
          this.logger.warn(`Field ${field.fieldName} already exists for document ${documentId}`);
          return null;
        }
        throw error;
      }),
    );

    await Promise.all(fieldPromises);
    this.logger.log(`Stored ${fields.length} fields for document ${documentId}`);
  }

  /**
   * Extract issuer country from verification result
   * Checks multiple possible field names that Regula might return
   */
  private extractIssuerCountry(result: RegulaVerificationResult): string | null {
    // Try multiple possible field names in order of preference
    const possibleFieldNames = [
      'issuerCountry',
      'countryOfIssue',
      'issuingCountry',
      'country',
      'issuer',
    ];

    for (const fieldName of possibleFieldNames) {
      const field = result.fields.find((f) => 
        f.fieldName.toLowerCase() === fieldName.toLowerCase()
      );
      if (field?.value) {
        return field.value;
      }
    }

    // Fallback: search for any field containing 'country' or 'issuer'
    const countryField = result.fields.find((f) => 
      f.fieldName.toLowerCase().includes('country') ||
      f.fieldName.toLowerCase().includes('issuer')
    );
    
    return countryField?.value || null;
  }

  /**
   * Extract expiry date from verification result
   */
  private extractExpiryDate(result: RegulaVerificationResult): Date | null {
    const expiryField = result.fields.find((f) =>
      f.fieldName.toLowerCase().includes('expiry') ||
      f.fieldName.toLowerCase().includes('expiration') ||
      f.fieldName.toLowerCase().includes('expires')
    );
    
    if (!expiryField?.value) {
      return null;
    }

    try {
      return new Date(expiryField.value);
    } catch {
      return null;
    }
  }

  /**
   * Replace an existing document with a new one
   * - Re-verifies the new document
   * - Deletes old document fields and storage file
   * - Updates the document record (keeps same ID)
   */
  async replaceDocument(
    documentId: string,
    userId: string,
    userRole: Role,
    uploadDto: UploadDocumentDto,
  ) {
    // Verify user has USER role
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can replace documents');
    }

    // Find existing document (must belong to user)
    const existingDocument = await (this.prisma as any).document.findFirst({
      where: {
        id: documentId,
        userId, // Ensure user owns the document
      },
      include: {
        documentFields: {
          select: {
            id: true,
            fieldKey: true,
          },
        },
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found or you do not have permission to replace it');
    }

    // Validate image format
    this.validateImageFormat(uploadDto.image);

    // Validate document type matches (can't change document type when replacing)
    if (existingDocument.type !== uploadDto.type) {
      throw new BadRequestException(
        `Cannot change document type. Existing document is ${existingDocument.type}, but new document is ${uploadDto.type}. ` +
          `Please upload a new document instead of replacing this one.`,
      );
    }

    try {
      // Delete old document fields
      if (existingDocument.documentFields.length > 0) {
        await (this.prisma as any).documentField.deleteMany({
          where: { documentId },
        });
        this.logger.log(`Deleted ${existingDocument.documentFields.length} old fields for document ${documentId}`);
      }

      // Delete old storage file
      if (existingDocument.encryptedFilePath) {
        await deleteEncryptedDocument(existingDocument.encryptedFilePath);
        this.logger.log(`Deleted old storage file for document ${documentId}`);
      }

      // Re-verify document with Regula
      // Pass isValid from DTO (only used in test mode)
      this.logger.log(`Re-verifying ${uploadDto.type} document ${documentId} for user ${userId}`);
      const verificationResult = await this.regulaService.verifyDocument(
        uploadDto.image,
        uploadDto.type,
        uploadDto.isValid, // Optional: For test mode only
      );

      // Store new encrypted document file
      const newFilePath = await storeEncryptedDocument(documentId, uploadDto.image);

      // Update document record (keeps same ID and base fields like createdAt)
      const updatedDocument = await (this.prisma as any).document.update({
        where: { id: documentId },
        data: {
          status:
            verificationResult.status === 'success'
              ? DocumentStatus.VERIFIED
              : DocumentStatus.REJECTED,
          issuerCountry: this.extractIssuerCountry(verificationResult),
          expiredDate: this.extractExpiryDate(verificationResult),
          encryptedFilePath: newFilePath,
          // updatedAt will be automatically updated by Prisma
        },
      });

      // If verification successful, store new extracted fields
      let storedFields: any[] = [];
      if (verificationResult.status === 'success' && verificationResult.fields.length > 0) {
        await this.storeDocumentFields(documentId, verificationResult.fields);
        
        // Fetch stored fields to return in response
        storedFields = await (this.prisma as any).documentField.findMany({
          where: { documentId },
          select: {
            id: true,
            fieldKey: true,
          },
          orderBy: { fieldKey: 'asc' },
        });
      }

      this.logger.log(
        `Document ${documentId} replaced and ${verificationResult.status === 'success' ? 'verified' : 'rejected'}`,
      );

      return {
        id: updatedDocument.id,
        type: updatedDocument.type,
        status: updatedDocument.status,
        issuerCountry: updatedDocument.issuerCountry,
        expiredDate: updatedDocument.expiredDate,
        verificationStatus: verificationResult.status,
        fieldsExtracted: verificationResult.fields.length,
        fields: storedFields.map((f) => ({
          id: f.id,
          fieldKey: f.fieldKey,
        })),
        createdAt: updatedDocument.createdAt, // Original creation date preserved
        updatedAt: updatedDocument.updatedAt, // New update timestamp
      };
    } catch (error: any) {
      this.logger.error(`Error replacing document: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to replace document: ${error.message}`);
    }
  }

  /**
   * Delete a document and all related data
   * - Deletes document fields
   * - Deletes encrypted file from storage
   * - Deletes document record
   */
  async deleteDocument(documentId: string, userId: string, userRole: Role) {
    // Verify user has USER role
    if (userRole !== Role.USER) {
      throw new ForbiddenException('Only users with USER role can delete documents');
    }

    // Find document (must belong to user)
    const document = await (this.prisma as any).document.findFirst({
      where: {
        id: documentId,
        userId, // Ensure user owns the document
      },
      include: {
        documentFields: {
          select: {
            id: true,
            fieldKey: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found or you do not have permission to delete it');
    }

    try {
      // Delete document fields
      if (document.documentFields.length > 0) {
        await (this.prisma as any).documentField.deleteMany({
          where: { documentId },
        });
        this.logger.log(`Deleted ${document.documentFields.length} fields for document ${documentId}`);
      }

      // Delete encrypted file from storage
      if (document.encryptedFilePath) {
        await deleteEncryptedDocument(document.encryptedFilePath);
        this.logger.log(`Deleted storage file for document ${documentId}`);
      }

      // Delete document record (cascade will handle related records, but we've already cleaned up)
      await (this.prisma as any).document.delete({
        where: { id: documentId },
      });

      this.logger.log(`Document ${documentId} deleted successfully`);

      return {
        message: 'Document deleted successfully',
        documentId,
      };
    } catch (error: any) {
      this.logger.error(`Error deleting document: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Validate image format
   */
  private validateImageFormat(imageBase64: string) {
    // Check if it's a valid base64 string
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new BadRequestException('Invalid image format');
    }

    // Check base64 format
    const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    if (!base64Regex.test(imageBase64) && !/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
      throw new BadRequestException('Image must be base64 encoded JPEG, PNG, or WebP');
    }

    // Check minimum size (at least 1KB)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    if (sizeInBytes < 1024) {
      throw new BadRequestException('Image is too small');
    }

    // Check maximum size (10MB)
    if (sizeInBytes > 10 * 1024 * 1024) {
      throw new BadRequestException('Image is too large (max 10MB)');
    }
  }
}

