import { getSoftDeleteConditionWithDeletedAt } from '@/common/helpers/commonFunctions';
import {
    UserToken,
    UserTokenDocument,
} from '@/mongo-schemas/user-token.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../auth.constant';
import { ICreateUserTokenBody } from '../auth.interface';
@Injectable()
export class AuthMongoService {
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(UserToken.name)
        private readonly userTokenModel: Model<UserTokenDocument>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    public async checkHashTokenExist(hashToken: string) {
        try {
            const isHashTokenExist =
                (await this.userTokenModel.countDocuments({
                    ...getSoftDeleteConditionWithDeletedAt(new Date()),
                    hashToken,
                })) > 0;
            return isHashTokenExist;
        } catch (error) {
            this.logger.error('Error in checkHashTokenExist: ', error);
            throw error;
        }
    }

    public async createUserToken(token: ICreateUserTokenBody) {
        try {
            const newToken = new this.userTokenModel(token);
            return await newToken.save();
        } catch (error) {
            this.logger.error('Error in createUserToken service', error);
            throw error;
        }
    }
}
