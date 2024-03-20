export interface IPlaylist {
    name: string;
    userId: string;
}

export interface IPlaylistCreate {
    name: string;
}

export interface IPlaylistUpdate {
    name?: string;
    thumbnail?: string;
}

export interface IPlaylistAddSong {
    youtubeId: string;
}
