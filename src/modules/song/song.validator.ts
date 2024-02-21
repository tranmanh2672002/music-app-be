import Joi from '../../plugins/joi';
import { INPUT_TEXT_MAX_LENGTH } from './../../common/constants';

export const songCreateSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    youtubeId: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    artist: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
