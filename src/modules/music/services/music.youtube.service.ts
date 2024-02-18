import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../music.constant';
import { MusicClient } from 'youtubei';
import ytdl from '@distube/ytdl-core';

@Injectable()
export class MusicService {
    constructor(
        private readonly configService: ConfigService,
        private readonly musicClient: MusicClient,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async search(keyword: string) {
        try {
            const result = await this.musicClient.search(keyword, 'song');
            return result;
        } catch (error) {
            this.logger.error('Error search in music service', error);
            throw error;
        }
    }

    async getDetail(id: string) {
        try {
            const info = await ytdl.getInfo(
                'https://www.youtube.com/watch?v=' + id,
            );
            if (info && info?.formats) {
                const audioFormats = info.formats
                    .filter((x) => x.mimeType?.startsWith('audio/'))
                    .sort((a, b) => {
                        return (b?.audioBitrate || 0) - (a?.audioBitrate || 0);
                    });
                const data = {
                    id,
                    url: audioFormats[0].url,
                    detail: info.videoDetails,
                };
                return data;
            }
            return false;
        } catch (error) {
            this.logger.error('Error get detail in music service', error);
            throw error;
        }
    }
}
