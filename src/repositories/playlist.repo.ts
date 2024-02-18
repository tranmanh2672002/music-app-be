import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist, PlaylistDocument } from '@/mongo-schemas/playlist.schema';

export class PlaylistRepo extends BaseRepository<PlaylistDocument> {
    constructor(
        @InjectModel(Playlist.name)
        playlistModel: SoftDeleteModel<PlaylistDocument>,
    ) {
        super(playlistModel);
    }
}
