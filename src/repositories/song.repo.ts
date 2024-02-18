import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import { Song, SongDocument } from '@/mongo-schemas/song.schema';

export class SongRepo extends BaseRepository<SongDocument> {
    constructor(
        @InjectModel(Song.name) songModel: SoftDeleteModel<SongDocument>,
    ) {
        super(songModel);
    }
}
