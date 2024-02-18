import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { SuccessResponse } from '@/common/helpers/response';
import {
    Controller,
    Get,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UserMongoService } from '../user/services/user.mongo.service';

@Controller('/common')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CommonController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userMongoService: UserMongoService,
    ) {
        //
    }

    @Get('/dropdown/user')
    async getAllUser() {
        try {
            const users = await this.userMongoService.getAllUsers([
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
