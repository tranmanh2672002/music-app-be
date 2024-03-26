import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ObjectId, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { HttpStatus } from './../../common/constants';
import { UserMongoService } from './services/user.mongo.service';
import { UserField, userAttributes } from './user.constant';
import {
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from './user.interface';
import {
    createUserSchema,
    mongoIdSchema,
    updateUserSchema,
    userListQuerySchema,
    userRecentlyMusicUpdateSchema,
} from './user.validator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SongService } from '../song/services/song.service';
import { MusicService } from '../music/services/music.youtube.service';

@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
    constructor(
        private readonly i18n: I18nService,
        private readonly userService: UserMongoService,
        private readonly musicService: MusicService,
        private readonly songService: SongService,
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
    @UseInterceptors(CacheInterceptor)
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
                req?.loginUser?._id,
            );
            return new SuccessResponse(data);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @UseInterceptors(CacheInterceptor)
    // GET favorite music
    @Get('/favorite-music')
    async getFavoriteMusic(@Req() req) {
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
            const data = await this.userService.getFavoriteMusic(
                req?.loginUser?._id,
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

            // check song in database has youtubeId
            let songId;
            const song = await this.songService.getByYoutubeId(body?.id);
            if (!song) {
                const data = await this.musicService.getDetail(body.id);
                if (data) {
                    const newSong = await this.songService.create({
                        name: data?.title,
                        artist: data?.artist?.name,
                        youtubeId: body?.id,
                        thumbnails: data?.thumbnails,
                        duration: data?.duration,
                    });
                    songId = newSong._id;
                } else {
                    return new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        'Music not exists',
                        [],
                    );
                }
            } else {
                songId = song._id;
            }

            const newRecentlyMusicIds =
                user.recentlyMusicIds?.filter((item) => !item.equals(songId)) ||
                [];
            newRecentlyMusicIds.unshift(songId);
            await this.userService.updateRecentlyMusicId(
                req?.loginUser?._id,
                newRecentlyMusicIds,
            );
            return new SuccessResponse(true);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    // favorite music
    @Patch('/favorite-music')
    async addFavoriteMusic(
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

            // check song in database has youtubeId
            let songId;
            const song = await this.songService.getByYoutubeId(body?.id);
            if (!song) {
                const data = await this.musicService.getDetail(body.id);
                if (data) {
                    const newSong = await this.songService.create({
                        name: data?.title,
                        artist: data?.artist?.name,
                        youtubeId: body?.id,
                        thumbnails: data?.thumbnails,
                        duration: data?.duration,
                    });
                    songId = newSong._id;
                } else {
                    return new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        'Music not exists',
                        [],
                    );
                }
            } else {
                songId = song._id;
            }

            await this.userService.updateFavoriteMusicId(
                req?.loginUser?._id,
                songId,
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

    @Delete('recently-music/:id')
    async removeMusicRecently(
        @Param() params: { id: Types.ObjectId },
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
            const recentlyMusicIds = user.recentlyMusicIds || [];
            if (!recentlyMusicIds.some((item) => item.equals(params.id))) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.musicNotFound'),
                    [],
                );
            } else {
                const newRecentlyMusicIds = recentlyMusicIds.filter(
                    (item) => !item.equals(params.id),
                );
                await this.userService.updateRecentlyMusicId(
                    req?.loginUser?._id,
                    newRecentlyMusicIds,
                );
                return new SuccessResponse(true);
            }
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Delete('favorite-music/:id')
    async removeMusicFavorite(
        @Param() params: { id: Types.ObjectId },
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
            const favoriteMusicIds = user.favoriteMusicIds || [];
            if (!favoriteMusicIds.some((item) => item.equals(params.id))) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.musicNotFound'),
                    [],
                );
            } else {
                const newFavoriteMusicIds = favoriteMusicIds.filter(
                    (item) => !item.equals(params.id),
                );
                await this.userService.setFavoriteMusicId(
                    req?.loginUser?._id,
                    newFavoriteMusicIds,
                );
                return new SuccessResponse(true);
            }
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
