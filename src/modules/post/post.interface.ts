import { ICommonListQuery } from '@/common/interfaces';

export interface IPost {
    name: string;
    userId: string;
}

export interface IPostCreate {
    description?: string;
    type: POST_TYPE;
    musicId?: string;
    playlistId?: string;
}

export interface IPostUpdate {
    description: string;
}

export enum POST_TYPE {
    SONG = 'SONG',
    PLAYLIST = 'PLAYLIST',
}

export type IPostListQuery = ICommonListQuery;
