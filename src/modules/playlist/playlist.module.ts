import { MusicService } from './../music/services/music.youtube.service';
import { PlaylistService } from './services/playlist.service';
import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { JwtService } from '@nestjs/jwt';
import { PlaylistRepo } from '@/repositories/playlist.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from '@/mongo-schemas/playlist.schema';
import { SongRepo } from '@/repositories/song.repo';
import { Song, SongSchema } from '@/mongo-schemas/song.schema';
import { MusicClient } from 'youtubei';
import { SongService } from '../song/services/song.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Playlist.name, schema: PlaylistSchema },
            { name: Song.name, schema: SongSchema },
        ]),
    ],
    controllers: [PlaylistController],
    providers: [
        PlaylistService,
        JwtService,
        PlaylistRepo,
        SongRepo,
        MusicService,
        MusicClient,
        SongService,
    ],
    exports: [PlaylistService],
})
export class PlaylistModule {
    //
}
