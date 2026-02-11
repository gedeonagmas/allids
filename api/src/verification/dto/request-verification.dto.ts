import { IsString, IsEnum, IsArray, IsOptional, IsNotEmpty, Matches } from 'class-validator';
import { DocumentType, AccessType } from '@prisma/client';

export class RequestVerificationDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format' })
    phone: string;

    @IsEnum(DocumentType)
    documentType: DocumentType;

    @IsEnum(AccessType)
    accessType: AccessType;

    @IsString()
    @IsNotEmpty()
    purpose: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    fields?: string[];
}
