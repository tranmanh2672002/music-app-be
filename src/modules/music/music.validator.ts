import { INPUT_TEXT_MAX_LENGTH, Regex } from './../../common/constants';
import Joi from 'src/plugins/joi';

export const musicSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    url: Joi.string().required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    projects: Joi.array()
        .items(
            Joi.object({
                id: Joi.isObjectId(),
                projectRole: Joi.string(),
            }),
        )
        .allow(null),
    id: Joi.isObjectId(),
});

export const musicSearchSchema = Joi.object().keys({
    keyword: Joi.string().required(),
});
