import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import {
    ListenRecently,
    ListenRecentlyDocument,
} from '@/mongo-schemas/listen-recently.schema';

export class ListenRecentlyRepo extends BaseRepository<ListenRecentlyDocument> {
    constructor(
        @InjectModel(ListenRecently.name)
        listenRecentlyModel: SoftDeleteModel<ListenRecentlyDocument>,
    ) {
        super(listenRecentlyModel);
    }
}
