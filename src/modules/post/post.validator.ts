import { baseFilterSchema } from './../../common/validator';
import { POST_TYPE } from './post.interface';
import Joi from '../../plugins/joi';
import { INPUT_TEXT_MAX_LENGTH } from './../../common/constants';
import { musicIdSchema } from '../common/common.validate';

export const postCreateSchema = Joi.object().keys({
    description: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
    type: Joi.valid(...Object.values(POST_TYPE)).required(),
    musicId: musicIdSchema.required(),
    playlistId: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional(),
});

export const postUpdateSchema = Joi.object().keys({
    description: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export const postQuerySchema = Joi.object().keys({
    ...baseFilterSchema,
});
