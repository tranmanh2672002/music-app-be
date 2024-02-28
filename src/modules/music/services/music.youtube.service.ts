import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import {
    MODULE_NAME,
    MUSIC_YOUTUBE_BASE_URL,
    MUSIC_YOUTUBE_TYPE,
} from '../music.constant';
import { MusicClient } from 'youtubei';
import ytdl from '@distube/ytdl-core';
import {
    convertToMusicYoutubeSongDetail,
    convertToMusicYoutubeSongList,
} from '../music.helper';

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
            const result = await this.musicClient.search(
                keyword,
                MUSIC_YOUTUBE_TYPE.SONG,
            );
            return convertToMusicYoutubeSongList(result?.items);
        } catch (error) {
            this.logger.error('Error search in music service', error);
            throw error;
        }
    }

    async getDetail(id: string) {
        try {
            const info = await ytdl.getInfo(MUSIC_YOUTUBE_BASE_URL + id);
            if (info && info?.formats) {
                const audioFormats = info.formats
                    .filter((x) => x.mimeType?.startsWith('audio/'))
                    .sort((a, b) => {
                        return (b?.audioBitrate || 0) - (a?.audioBitrate || 0);
                    });
                return convertToMusicYoutubeSongDetail(
                    id,
                    audioFormats[0]?.url,
                    info?.videoDetails,
                );
            }
            return null;
        } catch (error) {
            this.logger.error('Error get detail in music service', error);
            throw error;
        }
    }
}
