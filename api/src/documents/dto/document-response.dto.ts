import { DocumentType, DocumentStatus } from '@prisma/client';

export class DocumentFieldResponseDto {
  id: string;
  fieldKey: string;
  // Note: fieldValueEncrypted is not included for security - only decrypted when specifically requested
}

export class DocumentUploadResponseDto {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  issuerCountry?: string | null;
  expiredDate?: Date | null;
  verificationStatus: 'success' | 'failure';
  fieldsExtracted: number;
  fields: DocumentFieldResponseDto[];
  createdAt: Date;
}

export class DocumentResponseDto {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  issuerCountry?: string | null;
  expiredDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fieldsCount: number;
  fields: DocumentFieldResponseDto[];
}

