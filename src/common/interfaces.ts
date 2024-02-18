import { OrderDirection } from './constants';

export interface IUserToken {
    _id: string;
    email: string;
    fullName: string;
}
export interface ICommonListQuery {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: OrderDirection;
    keyword?: string;
}
