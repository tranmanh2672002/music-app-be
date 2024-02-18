import {
    INPUT_TEXT_MAX_LENGTH,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';

import Joi from 'src/plugins/joi';
import { AuthProvider } from './auth.constant';

export const getGoogleLoginUrlQuerySchema = Joi.object().keys({
    redirectUri: Joi.string().max(TEXTAREA_MAX_LENGTH).uri().required(),
});

export const loginBodySchema = Joi.object().keys({
    provider: Joi.string()
        .valid(...Object.values(AuthProvider))
        .required(),
    email: Joi.when('provider', {
        is: AuthProvider.EMAIL,
        then: Joi.string()
            .regex(Regex.EMAIL)
            .max(INPUT_TEXT_MAX_LENGTH)
            .required(),
        otherwise: Joi.forbidden(),
    }),
    password: Joi.when('provider', {
        is: AuthProvider.EMAIL,
        then: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
        otherwise: Joi.forbidden(),
    }),

    token: Joi.when('provider', {
        is: Joi.valid(AuthProvider.GOOGLE),
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    redirectUri: Joi.when('provider', {
        switch: [
            {
                is: Joi.exist().valid(AuthProvider.GOOGLE),
                then: Joi.string().max(TEXTAREA_MAX_LENGTH).uri().required(),
            },
        ],
        otherwise: Joi.forbidden(),
    }),
});

export const registerBodySchema = Joi.object().keys({
    email: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    password: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export const updateUserProfileSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
