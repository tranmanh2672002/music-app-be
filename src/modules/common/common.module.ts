import { User, UserSchema } from '@/mongo-schemas/user.schema';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoService } from '../user/services/user.mongo.service';
import { CommonController } from './common.controller';
import { GitlabErrorService } from './services/gitlab.error.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [CommonController],
    providers: [UserMongoService, JwtService, GitlabErrorService],
    exports: [GitlabErrorService],
})
export class CommonModule {
    //
}
