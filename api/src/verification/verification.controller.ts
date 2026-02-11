import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { ApproveVerificationDto } from './dto/approve-verification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) { }

    @Post('request')
    @Roles('ORG')
    @UseGuards(RolesGuard)
    async requestVerification(
        @CurrentUser() org: any,
        @Body() dto: RequestVerificationDto,
    ) {
        return this.verificationService.requestVerification(org.id, dto);
    }

    @Post('approve')
    async approveVerification(
        @CurrentUser() user: any,
        @Body() dto: ApproveVerificationDto,
    ) {
        return this.verificationService.approveVerification(user.id, dto);
    }

    @Post('deny/:requestId')
    async denyVerification(
        @CurrentUser() user: any,
        @Param('requestId') requestId: string,
    ) {
        return this.verificationService.denyVerification(user.id, requestId);
    }

    @Get('history')
    async getHistory(@CurrentUser() entity: any) {
        const role = entity.role;
        return this.verificationService.getHistory(entity.id, role);
    }

    @Get('grant/:grantId')
    @Roles('ORG')
    @UseGuards(RolesGuard)
    async getGrantData(
        @CurrentUser() org: any,
        @Param('grantId') grantId: string,
    ) {
        return this.verificationService.getGrantData(org.id, grantId);
    }

    @Post('revoke/:grantId')
    async revokeGrant(
        @CurrentUser() user: any,
        @Param('grantId') grantId: string,
    ) {
        return this.verificationService.revokeGrant(user.id, grantId);
    }
}
