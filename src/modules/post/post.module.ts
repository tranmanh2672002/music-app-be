import { PostService } from './services/post.service';
import { Post, PostSchema } from '@/mongo-schemas/post.schema';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './post.controller';
import { PostRepo } from '@/repositories/post.repo';
import { MusicService } from '../music/services/music.youtube.service';
import { MusicClient } from 'youtubei';
import { UserRepo } from '@/repositories/user.repo';
import { User, UserSchema } from '@/mongo-schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [PostController],
    providers: [
        PostService,
        JwtService,
        PostRepo,
        MusicService,
        MusicClient,
        UserRepo,
    ],
    exports: [PostService],
})
export class PostModule {
    //
}
