import { ObjectId } from 'mongoose';
import { AuthProvider, UserTokenType } from './auth.constant';
import { SystemRole } from '../user/user.constant';

export interface ILoginBody {
    provider: AuthProvider;
    email?: string;
    password?: string;
    token?: string;
    redirectUri?: string;
}

export interface IRegisterBody {
    email?: string;
    password?: string;
}

export interface IUpdateUserProfileBody {
    name: string;
}

export interface IGoogleLoginLinkQuery {
    redirectUri: string;
}

export interface IGoogleData {
    id: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    picture: string;
}

export interface ICreateUserTokenBody {
    userId: ObjectId;
    hashToken: string;
    token: string;
    type: UserTokenType;
    createdBy?: ObjectId;
    deletedAt?: Date;
}

export interface ILoginUser {
    _id: string;
    email: string;
    name: string;
    systemRole: SystemRole;
}
