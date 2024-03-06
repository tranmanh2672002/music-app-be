import { POST_TYPE } from './../post.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../post.constant';
import { PostRepo } from '@/repositories/post.repo';
import { IPostCreate } from '../post.interface';
import { MusicService } from '@/modules/music/services/music.youtube.service';
import { IMusicYoutubeSongDetail } from '@/modules/music/music.interface';

@Injectable()
export class PostService {
    constructor(
        private readonly configService: ConfigService,
        private readonly postRepo: PostRepo,
        private readonly musicService: MusicService,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getList() {
        try {
            const posts = await this.postRepo.findAll();
            return posts;
        } catch (error) {
            this.logger.error('Error get list in post service', error);
            throw error;
        }
    }

    async getDetail(id: string) {
        try {
            const post = await this.postRepo.findById(id);
            // populate posts
            return post;
        } catch (error) {
            this.logger.error('Error get in post service', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const post = await this.postRepo.findById(id);
            return post;
        } catch (error) {
            this.logger.error('Error getById in post service', error);
            throw error;
        }
    }

    async create(data: IPostCreate, userId: string) {
        try {
            let song;
            if (data.type === POST_TYPE.SONG) {
                const res = await this.musicService.getDetail(data.musicId);
                song = {
                    musicId: data.musicId,
                    title: res?.title,
                    artist: res?.artist,
                    thumbnails: res?.thumbnails,
                    viewCount: res?.viewCount,
                };
            }
            const post = await this.postRepo.create({
                ...data,
                song,
                userId,
            });
            return post;
        } catch (error) {
            this.logger.error('Error create in post service', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.postRepo.delete({ _id: id });
            return id;
        } catch (error) {
            this.logger.error('Error delete in post service', error);
            throw error;
        }
    }
}
