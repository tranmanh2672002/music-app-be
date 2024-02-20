export const MODULE_NAME = 'user';

export const userAttributes = ['_id', 'email', 'provider'];

export enum UserOrderBy {
    EMAIL = 'email',
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export enum SystemRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
}

export enum SystemRoleFilter {
    ADMIN = 'admin',
    DEVELOPER = 'developer',
    ALL = 'all',
}

export enum UserField {
    ID = '_id',
    NAME = 'name',
    EMAIL = 'email',
    SYSTEM_ROLE = 'systemRole',
}
