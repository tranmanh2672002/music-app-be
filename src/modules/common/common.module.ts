import { User, UserSchema } from '@/mongo-schemas/user.schema';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonController } from './common.controller';
import { UserRepo } from '@/repositories/user.repo';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [CommonController],
    providers: [JwtService, UserRepo],
    exports: [],
})
export class CommonModule {
    //
}
