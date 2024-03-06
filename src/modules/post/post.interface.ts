export interface IPost {
    name: string;
    userId: string;
}

export interface IPostCreate {
    description?: string;
    type: POST_TYPE;
    musicId?: string;
    playlist?: string;
}

export enum POST_TYPE {
    SONG = 'SONG',
    PLAYLIST = 'PLAYLIST',
}
