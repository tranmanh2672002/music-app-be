import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../song.constant';
import { SongRepo } from '@/repositories/song.repo';
import { ISongCreate } from '../song.interface';

@Injectable()
export class SongService {
    constructor(
        private readonly configService: ConfigService,
        private readonly songRepo: SongRepo,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getList(userId: string) {
        try {
            const songs = await this.songRepo.find({ userId });
            return songs;
        } catch (error) {
            this.logger.error('Error get list in song service', error);
            throw error;
        }
    }

    async getDetail(id: string) {
        try {
            const song = await this.songRepo.findById(id);
            // populate songs
            return song;
        } catch (error) {
            this.logger.error('Error get in song service', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const song = await this.songRepo.findById(id);
            return song;
        } catch (error) {
            this.logger.error('Error getById in song service', error);
            throw error;
        }
    }

    async getByYoutubeId(id: string) {
        try {
            const song = await this.songRepo.findOne({ youtubeId: id });
            return song;
        } catch (error) {
            this.logger.error('Error getByYoutubeId in song service', error);
            throw error;
        }
    }

    async create(data: ISongCreate) {
        try {
            const song = await this.songRepo.create(data);
            return song;
        } catch (error) {
            this.logger.error('Error create in song service', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.songRepo.delete({ _id: id });
            return id;
        } catch (error) {
            this.logger.error('Error delete in song service', error);
            throw error;
        }
    }
}
