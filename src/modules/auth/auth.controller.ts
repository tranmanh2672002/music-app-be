import ConfigKey from '@/common/config/config-key';
import { DateFormat, HttpStatus } from '@/common/constants';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { extractToken, hashPassword } from '@/common/helpers/commonFunctions';
import { TrimBodyPipe } from '@/common/pipe/trim.body.pipe';
import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { UserMongoService } from '../user/services/user.mongo.service';
import { userAttributes } from '../user/user.constant';
import { AuthProvider, UserTokenType } from './auth.constant';
import {
    ILoginBody,
    IRegisterBody,
    IUpdateUserProfileBody,
} from './auth.interface';
import {
    getGoogleLoginUrlQuerySchema,
    loginBodySchema,
    registerBodySchema,
    updateUserProfileSchema,
} from './auth.validator';
import { AuthGoogleService } from './services/auth.google.service';
import { AuthLoginService } from './services/auth.login.service';
import { AuthMongoService } from './services/auth.mongo.service';
import { Response } from 'express';
import { UserRepo } from '@/repositories/user.repo';

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly authMongoService: AuthMongoService,
        private readonly userMongoService: UserMongoService,
        private readonly authGoogleService: AuthGoogleService,
        private readonly loginService: AuthLoginService,
        private readonly jwtService: JwtService,
        private readonly userRepo: UserRepo,
    ) {
        //
    }

    @Get('/google-login-url')
    async requestSocialLoginUrl(
        @Query(new JoiValidationPipe(getGoogleLoginUrlQuerySchema)) query,
    ) {
        try {
            const loginUrl = this.authGoogleService.getGoogleLoginUrl(query);
            if (!loginUrl) {
                return new ErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    this.i18n.t('auth.error.invalidLoginInfo'),
                    [],
                );
            }
            return new SuccessResponse({ loginUrl });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('login')
    async login(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(loginBodySchema))
        body: ILoginBody,
        @Res({ passthrough: true })
        response: Response,
    ) {
        try {
            const authenticateResult = await this.loginService.authenticate(
                body,
            );
            if (!authenticateResult.success) {
                return new ErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    authenticateResult.errorMessage,
                    [],
                );
            }
            const accessToken = this.loginService.generateAccessToken(
                authenticateResult.user,
            );
            const hashToken = this.loginService.generateHashToken(
                authenticateResult.user?._id,
            );
            const refreshToken = this.loginService.generateRefreshToken(
                authenticateResult.user,
                hashToken,
            );
            await this.authMongoService.createUserToken({
                token: refreshToken.token,
                type: UserTokenType.REFRESH_TOKEN,
                hashToken,
                deletedAt: dayjs()
                    .add(refreshToken.expiresIn, 'seconds')
                    .format(
                        DateFormat.YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON,
                    ) as unknown as Date,
                userId: authenticateResult.user._id,
                createdBy: authenticateResult.user._id,
            });
            response.cookie('refreshToken', refreshToken.token, {
                httpOnly: true,
                maxAge: +refreshToken.expiresIn * 1000,
                // sameSite: 'none',
            });
            return new SuccessResponse({
                profile: authenticateResult.user,
                accessToken,
            });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('register')
    async register(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(registerBodySchema))
        body: IRegisterBody,
    ) {
        const isUserExist = await this.userRepo.findOne({ email: body.email });
        if (isUserExist) {
            return new ErrorResponse(
                HttpStatus.ITEM_ALREADY_EXIST,
                'Email already exists',
                [],
            );
        }
        const user = await this.userMongoService.createUser({
            provider: AuthProvider.EMAIL,
            email: body.email,
            password: hashPassword(body.password),
        });
        return new SuccessResponse(user);
    }
    catch(error) {
        return new InternalServerErrorException(error);
    }

    @UseGuards(AuthenticationGuard)
    @Get('/profile')
    async getProfile(@Req() req) {
        try {
            const { loginUser } = req;
            const profile = await this.userMongoService.getUserById(
                userAttributes,
                loginUser._id,
            );
            return new SuccessResponse(profile);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @UseGuards(AuthenticationGuard)
    @Patch('/profile')
    async updateUserProfile(
        @Req() req,
        @Body(new JoiValidationPipe(updateUserProfileSchema))
        body: IUpdateUserProfileBody,
    ) {
        try {
            const { loginUser } = req;
            const profile = await this.userMongoService.updateUser(
                loginUser._id,
                { ...body, updatedBy: loginUser._id },
            );
            return new SuccessResponse(profile);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/refresh-token')
    async refreshToken(
        @Req() req,
        @Res({ passthrough: true })
        response: Response,
    ) {
        try {
            // const token = extractToken(req.headers.authorization || '');
            const token = req.cookies?.refreshToken;
            if (!token) {
                const message = await this.i18n.translate('errors.401');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message, []);
            }
            const user = await this.jwtService.verify(token, {
                secret: this.configService.get(
                    ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY,
                ),
                ignoreExpiration: false,
            });
            const { _id, hashToken } = user;
            // check hashToken, user exist?
            const [isHashTokenExist, loginUser] = await Promise.all([
                this.authMongoService.checkHashTokenExist(hashToken),
                this.userMongoService.getUserById(userAttributes, _id),
            ]);
            if (!isHashTokenExist) {
                const message = await this.i18n.translate(
                    'auth.refreshToken.errors.hashTokenInvalid',
                );
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message, []);
            }
            if (!loginUser) {
                const message = await this.i18n.translate(
                    'auth.refreshToken.errors.userNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const accessToken =
                this.loginService.generateAccessToken(loginUser);
            const newHashToken = this.loginService.generateHashToken(
                loginUser._id,
            );
            const refreshToken = this.loginService.generateRefreshToken(
                loginUser,
                newHashToken,
            );
            response.cookie('refreshToken', refreshToken.token, {
                httpOnly: true,
                maxAge: +refreshToken.expiresIn * 1000,
                // sameSite: 'none',
            });

            await this.authMongoService.createUserToken({
                token: refreshToken.token,
                type: UserTokenType.REFRESH_TOKEN,
                hashToken: newHashToken,
                deletedAt: dayjs()
                    .add(refreshToken.expiresIn, 'seconds')
                    .format(
                        DateFormat.YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON,
                    ) as unknown as Date,
                userId: loginUser._id,
                createdBy: loginUser._id,
            });
            return new SuccessResponse({
                profile: loginUser,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
