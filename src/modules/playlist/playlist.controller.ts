import { AuthenticationGuard } from './../../common/guards/authentication.guard';
import { IPlaylistAddSong, IPlaylistCreate } from './playlist.interface';
import {
    Controller,
    Get,
    Post,
    InternalServerErrorException,
    Query,
    Body,
    Req,
    UseGuards,
    Delete,
    Param,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import {
    playlistAddSongSchema,
    playlistCreateSchema,
    playlistRemoveSongSchema,
} from './playlist.validator';
import { PlaylistService } from './services/playlist.service';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { HttpStatus } from '@/common/constants';
import { SongService } from '../song/services/song.service';
import { MusicService } from '../music/services/music.youtube.service';

@UseGuards(AuthenticationGuard)
@Controller('playlist')
export class PlaylistController {
    constructor(
        private readonly playlistService: PlaylistService,
        private readonly songService: SongService,
        private readonly musicService: MusicService,
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

    @Get('/get/:id/detail')
    async getDetail(@Param('id') id) {
        try {
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
            const song = await this.songService.getByYoutubeId(body?.youtubeId);
            if (!song) {
                const data = await this.musicService.getDetail(body.youtubeId);
                if (data) {
                    const newSong = await this.songService.create({
                        name: data?.title,
                        artist: data?.artist?.name,
                        youtubeId: body?.youtubeId,
                        thumbnails: data?.thumbnails,
                    });
                    const result =
                        await this.playlistService.addSongIdToPlaylist(
                            playlistId,
                            newSong._id,
                        );
                    return new SuccessResponse(result);
                } else {
                    return new ErrorResponse(
                        HttpStatus.NOT_FOUND,
                        'Music not exists',
                        [],
                    );
                }
            }
            const result = await this.playlistService.addSongIdToPlaylist(
                playlistId,
                song._id,
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
            // check song in database has youtubeId
            const song = await this.songService.getById(body?.id);
            if (!song) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Song not exists',
                    [],
                );
            }
            const result = await this.playlistService.removeSongIdToPlaylist(
                playlistId,
                song._id,
            );
            return new SuccessResponse(result);
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
