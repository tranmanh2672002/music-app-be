import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '@/mongo-schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoService } from './services/user.mongo.service';
import { UserController } from './user.controller';
import { UserRepo } from '@/repositories/user.repo';
import { MusicService } from '../music/services/music.youtube.service';
import { MusicClient } from 'youtubei';
import { SongService } from '../song/services/song.service';
import { SongRepo } from '@/repositories/song.repo';
import { Song, SongSchema } from '@/mongo-schemas/song.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Song.name, schema: SongSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [
        UserMongoService,
        JwtService,
        UserRepo,
        MusicService,
        MusicClient,
        SongService,
        SongRepo,
    ],
    exports: [UserMongoService],
})
export class UserModule {
    //
}
