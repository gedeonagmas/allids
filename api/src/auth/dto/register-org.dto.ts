import { IsString, IsEmail, IsEnum, IsOptional, MinLength, IsNotEmpty } from 'class-validator';

export enum OrganizationType {
  BANK = 'BANK',
  EMBASSY = 'EMBASSY',
  TRAFFIC_AUTHORITY = 'TRAFFIC_AUTHORITY',
  OTHER = 'OTHER',
}

export class RegisterOrgDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(OrganizationType)
  organizationType: OrganizationType;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @MinLength(6)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString({ each: true })
  @IsOptional()
  allowedDocumentTypes?: string[];
}

