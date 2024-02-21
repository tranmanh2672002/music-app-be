import { Song, SongSchema } from '@/mongo-schemas/song.schema';
import { SongRepo } from '@/repositories/song.repo';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { SongService } from './services/song.service';
import { SongController } from './song.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }]),
    ],
    controllers: [SongController],
    providers: [SongService, JwtService, SongRepo],
    exports: [SongService],
})
export class SongModule {
    //
}
