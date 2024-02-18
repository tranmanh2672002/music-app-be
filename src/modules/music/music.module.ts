import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './services/music.youtube.service';
import { MusicClient } from 'youtubei';

@Module({
    imports: [],
    controllers: [MusicController],
    providers: [MusicService, MusicClient],
    exports: [MusicService],
})
export class MusicModule {
    //
}
