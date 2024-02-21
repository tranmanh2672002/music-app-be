import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../playlist.constant';
import { PlaylistRepo } from '@/repositories/playlist.repo';

@Injectable()
export class PlaylistService {
    constructor(
        private readonly configService: ConfigService,
        private readonly playlistRepo: PlaylistRepo,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getList(userId: string) {
        try {
            const playlists = await this.playlistRepo.find({ userId });
            return playlists;
        } catch (error) {
            this.logger.error('Error get list in playlist service', error);
            throw error;
        }
    }

    async getDetail(id: string) {
        try {
            const playlist = await this.playlistRepo
                .findById(id)
                .populate('songIds');
            return playlist;
        } catch (error) {
            this.logger.error('Error get in playlist service', error);
            throw error;
        }
    }

    async get(id: string) {
        try {
            const playlist = await this.playlistRepo.findById(id);
            return playlist;
        } catch (error) {
            this.logger.error('Error get in playlist service', error);
            throw error;
        }
    }

    async create(userId: string, name: string) {
        try {
            const playlist = await this.playlistRepo.create({ userId, name });
            return playlist;
        } catch (error) {
            this.logger.error('Error create in playlist service', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.playlistRepo.delete({ _id: id });
            return id;
        } catch (error) {
            this.logger.error('Error delete in playlist service', error);
            throw error;
        }
    }

    async addSongIdToPlaylist(playlistId: string, songId: string) {
        try {
            const result = await this.playlistRepo.findByIdAndUpdate(
                playlistId,
                { $addToSet: { songIds: songId } },
                { new: true },
            );
            return result;
        } catch (error) {
            this.logger.error(
                'Error add song to playlist in playlist service',
                error,
            );
            throw error;
        }
    }

    async removeSongIdToPlaylist(playlistId: string, songId: string) {
        try {
            const result = await this.playlistRepo.findByIdAndUpdate(
                playlistId,
                { $pull: { songIds: songId } },
                { new: true },
            );
            return result;
        } catch (error) {
            this.logger.error(
                'Error remove song to playlist in playlist service',
                error,
            );
            throw error;
        }
    }
}
