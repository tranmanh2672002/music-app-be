import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '@/mongo-schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoService } from './services/user.mongo.service';
import { UserController } from './user.controller';
import { UserRepo } from '@/repositories/user.repo';
import { MusicService } from '../music/services/music.youtube.service';
import { MusicClient } from 'youtubei';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UserController],
    providers: [
        UserMongoService,
        JwtService,
        UserRepo,
        MusicService,
        MusicClient,
    ],
    exports: [UserMongoService],
})
export class UserModule {
    //
}
