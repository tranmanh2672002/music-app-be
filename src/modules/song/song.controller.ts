import { HttpStatus } from '@/common/constants';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from './../../common/guards/authentication.guard';
import { SongService } from './services/song.service';
import { ISongCreate } from './song.interface';
import { songCreateSchema } from './song.validator';

@UseGuards(AuthenticationGuard)
@Controller('song')
export class SongController {
    constructor(private readonly songService: SongService) {}

    @Get('/get-list')
    async getList(@Req() req) {
        try {
            const songs = await this.songService.getList(req?.loginUser?._id);
            return new SuccessResponse(songs);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/get/:id/detail')
    async getDetail(@Param('id') id) {
        try {
            const song = await this.songService.getById(id);
            return new SuccessResponse(song);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('/create')
    async create(
        @Req() req,
        @Body(new JoiValidationPipe(songCreateSchema))
        body: ISongCreate,
    ) {
        try {
            const song = await this.songService.create(body);
            return new SuccessResponse(song);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/delete/:id')
    async delete(
        @Param('id')
        id: string,
    ) {
        try {
            const song = await this.songService.getById(id);
            if (!song) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Song not exists',
                    [],
                );
            }
            await this.songService.delete(id);
            return new SuccessResponse({ id });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
