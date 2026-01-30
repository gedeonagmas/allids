import { IsEnum, IsNotEmpty, IsString, IsBase64, IsOptional, IsBoolean } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsBase64()
  @IsNotEmpty()
  image: string; // Base64 encoded image

  @IsOptional()
  @IsBoolean()
  isValid?: boolean; // Optional: For test mode only - controls verification success/failure
}

