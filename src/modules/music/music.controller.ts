import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
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
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { IMusicSearchQuery } from './music.interface';
import { musicSearchSchema } from './music.validator';
import { MusicService } from './services/music.youtube.service';

@Controller('music')
export class MusicController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly musicService: MusicService,
    ) {}

    @Get('/search')
    async search(
        @Query(new JoiValidationPipe(musicSearchSchema))
        query: IMusicSearchQuery,
    ) {
        try {
            const data = await this.musicService.search(query.keyword);
            if (data) {
                return new SuccessResponse(data);
            } else {
                return new ErrorResponse(HttpStatus.NOT_FOUND, 'error', []);
            }
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/get-detail/:id')
    async getDetail(@Param('id') id: string) {
        try {
            const data = await this.musicService.getDetail(id);
            return new SuccessResponse(data);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
