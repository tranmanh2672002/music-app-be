import { ICommonListQuery } from 'src/common/interfaces';
import { SystemRole, SystemRoleFilter, UserOrderBy } from './user.constant';
import { ObjectId } from 'mongoose';

export interface IUserCreateBody {
    provider: string;
    email: string;
    password?: string;
    createdBy?: ObjectId;
}

export interface IUser extends IUserCreateBody {
    _id: ObjectId;
}

export interface IUserUpdateBody {
    name: string;
    updatedBy: ObjectId;
}

export interface IUserListQuery extends ICommonListQuery {
    orderBy: UserOrderBy;
    systemRole: SystemRoleFilter;
}
