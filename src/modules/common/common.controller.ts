import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { SuccessResponse } from '@/common/helpers/response';
import { UserRepo } from '@/repositories/user.repo';
import {
    Controller,
    Get,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

@Controller('/common')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CommonController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userRepo: UserRepo,
    ) {
        //
    }

    @Get('/dropdown/user')
    async getAllUser() {
        try {
            const users = await this.userRepo.find([
                '_id',
                'name',
                'systemRole',
                'email',
            ]);
            return new SuccessResponse(users);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
