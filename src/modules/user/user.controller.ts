import { HttpStatus } from './../../common/constants';
import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    Param,
    Delete,
    Patch,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UserMongoService } from './services/user.mongo.service';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import {
    createUserSchema,
    mongoIdSchema,
    updateUserSchema,
    userListQuerySchema,
    userRecentlyMusicUpdateSchema,
} from './user.validator';
import {
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from './user.interface';
import { userAttributes, UserField } from './user.constant';
import { ObjectId } from 'mongoose';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { musicIdSchema } from '../common/common.validate';

@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userService: UserMongoService,
    ) {
        //
    }

    @Get()
    async getUserList(
        @Query(new JoiValidationPipe(userListQuerySchema))
        query: IUserListQuery,
    ) {
        try {
            const data = await this.userService.getUserList(query);
            return new SuccessResponse(data);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    // GET recently music
    @Get('/recently-music')
    async getRecentlyMusic(@Req() req) {
        try {
            const user = await this.userService.getUserById(
                userAttributes,
                req?.loginUser?._id,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }
            const data = await this.userService.getRecentlyMusic(
                user?.recentlyMusicIds || [],
            );
            return new SuccessResponse(data);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getUserDetail(
        @Param(new JoiValidationPipe(mongoIdSchema)) params: { id: ObjectId },
    ) {
        try {
            const user = await this.userService.getUserById(
                userAttributes,
                params.id,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }
            return new SuccessResponse(user);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post()
    async createUser(
        @Body(new JoiValidationPipe(createUserSchema)) body: IUserCreateBody,
    ) {
        try {
            const oldUser = await this.userService.getUserByField(
                userAttributes,
                UserField.EMAIL,
                body.email,
            );
            if (oldUser) {
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    this.i18n.t('user.error.userAlreadyExist'),
                    [],
                );
            }
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(newUser);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    // recently music
    @Patch('/recently-music')
    async addRecentlyMusic(
        @Body(new JoiValidationPipe(userRecentlyMusicUpdateSchema))
        body: { id: string },
        @Req() req,
    ) {
        try {
            const user = await this.userService.getUserById(
                userAttributes,
                req?.loginUser?._id,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            await this.userService.updateRecentlyMusicId(
                req?.loginUser?._id,
                body.id,
            );
            return new SuccessResponse(true);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    async updateUser(
        @Body(new JoiValidationPipe(updateUserSchema))
        body: IUserUpdateBody,
        @Param(new JoiValidationPipe(mongoIdSchema)) params: { id: ObjectId },
    ) {
        try {
            const user = await this.userService.getUserById(
                userAttributes,
                params.id,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            const updateUser = await this.userService.updateUser(
                params.id,
                body,
            );

            return new SuccessResponse(updateUser);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    async deleteUser(
        @Param(new JoiValidationPipe(mongoIdSchema)) params: { id: ObjectId },
        @Req() req,
    ) {
        try {
            const user = await this.userService.getUserById(
                userAttributes,
                params.id,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            const { loginUser } = req;

            if (loginUser._id === params.id) {
                return new ErrorResponse(
                    HttpStatus.FORBIDDEN,
                    this.i18n.t('user.error.userDeleteMySelf'),
                    [],
                );
            }
            await this.userService.deleteUser(params.id, loginUser._id);
            return new SuccessResponse({
                _id: params.id,
                deletedBy: loginUser._id,
            });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
