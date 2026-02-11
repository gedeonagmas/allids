import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ApproveVerificationDto {
    @IsUUID()
    @IsNotEmpty()
    requestId: string;

    @IsUUID()
    @IsNotEmpty()
    documentId: string;
}
