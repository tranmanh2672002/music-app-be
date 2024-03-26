import { IThumbnail } from '@/common/interfaces';

export interface ISong {
    name: string;
    userId: string;
}

export interface ISongCreate {
    name: string;
    youtubeId: string;
    artist: string;
    thumbnails: IThumbnail[];
    duration: number;
}
