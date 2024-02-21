export interface IPlaylist {
    name: string;
    userId: string;
}

export interface IPlaylistCreate {
    name: string;
}

export interface IPlaylistAddSong {
    youtubeId: string;
}
