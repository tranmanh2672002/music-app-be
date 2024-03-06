import { INPUT_TEXT_MAX_LENGTH, Regex } from './../../common/constants';
import Joi from 'src/plugins/joi';
import { CommonListQuerySchema } from 'src/common/constants';
import { UserOrderBy, SystemRole, SystemRoleFilter } from './user.constant';
import { musicIdSchema } from '../common/common.validate';

export const userRecentlyMusicUpdateSchema = Joi.object().keys({
    id: musicIdSchema.required(),
});

export const userListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
    orderBy: Joi.string()
        .valid(...Object.values(UserOrderBy))
        .optional(),
    systemRole: Joi.string()
        .valid(...Object.values(SystemRoleFilter))
        .optional(),
});

export const createUserSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    url: Joi.string().required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    systemRole: Joi.string()
        .valid(...Object.values(SystemRole))
        .required(),
    projects: Joi.array()
        .items(
            Joi.object({
                id: Joi.isObjectId(),
                projectRole: Joi.string(),
            }),
        )
        .allow(null),
});

export const updateUserSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    systemRole: Joi.string()
        .valid(...Object.values(SystemRole))
        .required(),
    projects: Joi.array()
        .items(
            Joi.object({
                id: Joi.isObjectId(),
                projectRole: Joi.string(),
            }),
        )
        .allow(null),
});

export const mongoIdSchema = Joi.object().keys({
    id: Joi.isObjectId(),
});
