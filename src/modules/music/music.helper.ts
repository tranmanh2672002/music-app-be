import { IMusicYoutubeSong, IMusicYoutubeSongDetail } from './music.interface';

export const convertToMusicYoutubeSongList = (
    data: any,
): IMusicYoutubeSong[] => {
    return data?.map((item: any) => {
        return {
            id: item?.id,
            title: item?.title,
            artist: {
                id: item?.artists?.[0].id,
                name: item?.artists?.[0].name,
            },
            thumbnails: item?.thumbnails,
            duration: item?.duration,
        };
    });
};

export const convertToMusicYoutubeSongDetail = (
    id: string,
    url: string,
    data: any,
): IMusicYoutubeSongDetail => {
    return {
        id,
        url,
        title: data?.title,
        artist: {
            id: data?.author?.id,
            name: data?.author?.name,
            thumbnails: data?.author?.thumbnails,
        },
        thumbnails: data?.thumbnails,
        viewCount: data?.viewCount,
    };
};
