import { HttpStatus } from '@/common/constants';
import ConfigKey from '@/common/config/config-key';
import { UserMongoService } from '@/modules/user/services/user.mongo.service';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongoose';
import { createWinstonLogger } from '../../../common/services/winston.service';
import { AuthProvider, MODULE_NAME } from '../auth.constant';
import { ILoginBody } from '../auth.interface';
import { AuthGoogleService } from './auth.google.service';
import { AuthMongoService } from './auth.mongo.service';
import { I18nService } from 'nestjs-i18n';

import { SystemRole, userAttributes } from '@/modules/user/user.constant';
import { IUser } from '@/modules/user/user.interface';
import { UserRepo } from '@/repositories/user.repo';
import { ErrorResponse } from '@/common/helpers/response';
interface IAuthenticateResult {
    success: boolean;
    errorMessage?: string;
    user?: IUser;
}

@Injectable()
export class AuthLoginService {
    constructor(
        private readonly configService: ConfigService,
        private readonly authMongoService: AuthMongoService,
        private readonly authGoogleService: AuthGoogleService,
        private readonly userMongoService: UserMongoService,
        private readonly i18n: I18nService,
        private readonly userRepo: UserRepo,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async authenticate(body: ILoginBody): Promise<IAuthenticateResult> {
        let authenticateResult;
        switch (body.provider) {
            case AuthProvider.EMAIL:
                authenticateResult = await this.authenticateByEmail(
                    body.email,
                    body.password,
                );
                break;
            case AuthProvider.GOOGLE:
                authenticateResult = await this.authenticateByGoogle(
                    body.token,
                    body.redirectUri,
                );
                break;
            default:
                return {
                    success: false,
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                };
        }
        return authenticateResult;
    }

    async authenticateByEmail(
        email: string,
        password: string,
    ): Promise<IAuthenticateResult> {
        try {
            const user = (await this.userRepo
                .findOne({
                    email,
                    provider: AuthProvider.EMAIL,
                })
                .lean()) as IUser;

            if (!user || !password || !compareSync(password, user.password)) {
                return {
                    success: false,
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                };
            }

            delete user.password;

            return {
                success: true,
                user: user,
            };
        } catch (error) {
            this.logger.error('Error in authenticateByEmail: ', error);
            return {
                success: false,
                errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
            };
        }
    }

    async authenticateByGoogle(
        token: string,
        redirectUri: string,
    ): Promise<IAuthenticateResult> {
        try {
            const verifyResult = await this.authGoogleService.verifyGoogleToken(
                token,
                redirectUri,
            );
            if (!verifyResult?.success) {
                return {
                    success: false,
                    errorMessage: verifyResult.errorMessage,
                };
            }
            const user = (await this.userMongoService.getUserByField(
                [...userAttributes, 'password'],
                'email',
                verifyResult.googleData?.email,
            )) as IUser;
            if (user) {
                if (user.provider === AuthProvider.EMAIL) {
                    return {
                        success: false,
                        errorMessage: 'Email already exists',
                    };
                } else {
                    return {
                        success: true,
                        user,
                    };
                }
            } else {
                await this.userMongoService.createUser({
                    email: verifyResult.googleData?.email,
                    provider: AuthProvider.GOOGLE,
                });
                const newUser = (await this.userMongoService.getUserByField(
                    [...userAttributes, 'password'],
                    'email',
                    verifyResult.googleData?.email,
                )) as IUser;
                return {
                    success: true,
                    user: newUser,
                };
            }
        } catch (error) {
            this.logger.error('Error in authenticateByGoogle: ', error);
            return {
                success: false,
                errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
            };
        }
    }

    generateAccessToken(user: IUser) {
        const accessTokenExpiredIn = this.configService.get(
            ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN,
        );

        const tokenPrivateKey = this.configService
            .get(ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY)
            .replace(/\\n/g, '\n');
        const payloadToken = {
            _id: user._id,
            email: user.email,
            expiresIn: accessTokenExpiredIn,
        };
        const accessToken = jwt.sign(payloadToken, tokenPrivateKey, {
            expiresIn: accessTokenExpiredIn,
        });
        return {
            token: accessToken,
            expiresIn: accessTokenExpiredIn,
        };
    }

    generateRefreshToken(user: IUser, hashToken: string) {
        const refreshTokenExpiredIn = this.configService.get(
            ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN,
        );
        const tokenPrivateKey = this.configService
            .get(ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY)
            .replace(/\\n/g, '\n');

        const payloadToken = {
            _id: user._id,
            email: user.email,
            expiresIn: refreshTokenExpiredIn,
            hashToken,
        };
        const refreshToken = jwt.sign(payloadToken, tokenPrivateKey, {
            expiresIn: refreshTokenExpiredIn,
        });
        return {
            token: refreshToken,
            expiresIn: refreshTokenExpiredIn,
        };
    }

    generateHashToken(userId: ObjectId): string {
        return `${userId}-${Date.now()}`;
    }
}
