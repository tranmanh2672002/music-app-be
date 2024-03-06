import { Regex } from '@/common/constants';
import Joi from 'src/plugins/joi';

export const musicIdSchema = Joi.string().regex(Regex.MUSIC_ID);
