import bcrypt from 'bcrypt';
import { DateFormat } from '../constants';
import dayjs from '../../plugins/dayjs';

import dotenv from 'dotenv';
import _pick from 'lodash/pick';
dotenv.config();

const DEFAULT_TIMEZONE_NAME = process.env.TIMEZONE_DEFAULT_NAME;

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substring(7, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function convertTimeToUTC(time: string | Date) {
    return dayjs.tz(time, 'UTC').toDate();
}

export function isEndOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /23:59:59/.test(time);
}

export function isStartOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /00:00:00/.test(time);
}

/**
 * usecase: convert value of $select operator to value of $project operator in mongodb
 * example: ['_id', 'name'] => {
 *      _id: 1,
 *      name: 1,
 * }
 * @param attributeList attributes list select from mongo collection
 * @returns attributes list in $project operation
 */
export const parseMongoProjection = (
    attributeList: string[],
): Record<string, number> => {
    let rs = {};
    attributeList.forEach((val) => {
        rs = {
            ...rs,
            [val]: 1,
        };
    });

    return rs;
};

export function getSoftDeleteConditionWithDeletedAt(date: Date) {
    return {
        $or: [
            {
                deletedAt: {
                    $exists: true,
                    $gte: dayjs(date).format(
                        DateFormat.YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON,
                    ),
                },
            },
            {
                deletedAt: {
                    $exists: true,
                    $eq: null,
                },
            },
            {
                deletedAt: {
                    $exists: false,
                },
            },
        ],
    };
}

/**
 * Join string to API url instead of writing like
 * @returns URL
 */
export const formatApiUrl = (
    baseUrl: string,
    ...endpoints: (string | number)[]
): string => {
    return `${baseUrl}/${endpoints.join('/')}`;
};

export const getDataFields = (objectDetail: object, fields: string[]) => {
    return _pick(objectDetail, fields);
};
