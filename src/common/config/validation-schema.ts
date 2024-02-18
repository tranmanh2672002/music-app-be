import * as Joi from 'joi';
import ConfigKey from './config-key';

export default Joi.object({
    [ConfigKey.PORT]: Joi.number().default(3000),
    [ConfigKey.VERSION]: Joi.string().required(),
    [ConfigKey.BASE_PATH]: Joi.string().required(),
    [ConfigKey.CORS_WHITELIST]: Joi.string().required(),
    [ConfigKey.LOG_LEVEL]: Joi.string()
        .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
        .required(),
    [ConfigKey.MONGO_DATABASE_CONNECTION_STRING]: Joi.string().required(),
    [ConfigKey.MONGO_DEBUG]: Joi.string().required(),
    [ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY]: Joi.string().required(),
    [ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY]: Joi.string().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.GOOGLE_CLIENT_ID]: Joi.string().required(),
    [ConfigKey.GOOGLE_CLIENT_SECRET]: Joi.string().required(),
});
