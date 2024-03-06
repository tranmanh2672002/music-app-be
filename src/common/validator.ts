import Joi from '@/plugins/joi';
import { INPUT_TEXT_MAX_LENGTH, OrderDirection } from './constants';

export const baseFilterSchema = {
    keyword: Joi.string()
        .optional()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .allow('', null)
        .optional(),
    orderBy: Joi.string().optional(),
    orderDirection: Joi.string()
        .optional()
        .valid(...Object.values(OrderDirection)),
    limit: Joi.number().optional().integer().positive(),
    page: Joi.number().optional().integer().positive(),
};
