import Joi from '../../plugins/joi';
import { INPUT_TEXT_MAX_LENGTH } from './../../common/constants';

export const playlistCreateSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export const playlistAddSongSchema = Joi.object().keys({
    youtubeId: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export const playlistRemoveSongSchema = Joi.object().keys({
    id: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
