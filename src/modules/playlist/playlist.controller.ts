import { DEFAULT_PLAYLIST_THUMBNAIL, HttpStatus } from '@/common/constants';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { MusicService } from '../music/services/music.youtube.service';
import { AuthenticationGuard } from './../../common/guards/authentication.guard';
import {
    IPlaylistAddSong,
    IPlaylistCreate,
    IPlaylistUpdate,
} from './playlist.interface';
import {
    playlistAddSongSchema,
    playlistCreateSchema,
    playlistRemoveSongSchema,
    playlistUpdateSchema,
} from './playlist.validator';
import { PlaylistService } from './services/playlist.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SongService } from '../song/services/song.service';

@UseGuards(AuthenticationGuard)
@Controller('playlist')
export class PlaylistController {
    constructor(
        private readonly playlistService: PlaylistService,
        private readonly musicService: MusicService,
        private readonly songService: SongService,
    ) {}

    @Get('/get-list')
    async getList(@Req() req) {
        try {
            const playlists = await this.playlistService.getList(
                req?.loginUser?._id,
            );
            return new SuccessResponse(playlists);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/get/:id/detail')
    async getDetail(@Param('id') id) {
        try {
            const isExisted = await this.playlistService.get(id);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Playlist not exists',
                    [],
                );
            }
            const playlist = await this.playlistService.getDetail(id);
            return new SuccessResponse(playlist);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('/create')
    async create(
        @Req() req,
        @Body(new JoiValidationPipe(playlistCreateSchema))
        body: IPlaylistCreate,
    ) {
        try {
            const playlist = await this.playlistService.create(
                req?.loginUser?._id,
                body.name,
                DEFAULT_PLAYLIST_THUMBNAIL,
            );
            return new SuccessResponse(playlist);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('/add-song/:id')
    async addSong(
        @Param('id') playlistId: string,
        @Body(new JoiValidationPipe(playlistAddSongSchema))
        body: IPlaylistAddSong,
    ) {
        try {
            const playlist = await this.playlistService.get(playlistId);
            if (!playlist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Playlist not exists',
                    [],
                );
            }
            // check song in database has youtubeId
            let songId;
            const song = await this.songService.getByYoutubeId(body?.youtubeId);
            if (!song) {
                const data = await this.musicService.getDetail(body.youtubeId);
                if (data) {
                    const newSong = await this.songService.create({
                        name: data?.title,
                        artist: data?.artist?.name,
                        youtubeId: body?.youtubeId,
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
            const result = await this.playlistService.addSongIdToPlaylist(
                playlistId,
                songId,
            );
            return new SuccessResponse(result);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('/remove-song/:id')
    async removeSong(
        @Param('id') playlistId: string,
        @Body(new JoiValidationPipe(playlistRemoveSongSchema))
        body: { id: string },
    ) {
        try {
            const playlist = await this.playlistService.get(playlistId);
            if (!playlist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Playlist not exists',
                    [],
                );
            }
            const result = await this.playlistService.removeSongIdToPlaylist(
                playlistId,
                body.id,
            );
            return new SuccessResponse(result);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/update/:id')
    async update(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(playlistUpdateSchema))
        body: IPlaylistUpdate,
    ) {
        try {
            const playlist = await this.playlistService.get(id);
            if (!playlist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Playlist not exists',
                    [],
                );
            }
            const data = await this.playlistService.update(id, body);
            return new SuccessResponse(data);
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
            const playlist = await this.playlistService.get(id);
            if (!playlist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Playlist not exists',
                    [],
                );
            }
            await this.playlistService.delete(id);
            return new SuccessResponse({ id });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
