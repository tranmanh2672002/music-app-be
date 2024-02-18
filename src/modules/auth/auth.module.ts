import { UserToken, UserTokenSchema } from '@/mongo-schemas/user-token.schema';
import { User, UserSchema } from '@/mongo-schemas/user.schema';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoService } from '../user/services/user.mongo.service';
import { AuthController } from './auth.controller';
import { AuthGoogleService } from './services/auth.google.service';
import { AuthLoginService } from './services/auth.login.service';

import { AuthMongoService } from './services/auth.mongo.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
            { name: UserToken.name, schema: UserTokenSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [
        JwtService,
        AuthMongoService,
        AuthGoogleService,
        AuthLoginService,
        UserMongoService,
    ],
})
export class AuthModule {
    //
}
