import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '@/mongo-schemas/post.schema';

export class PostRepo extends BaseRepository<PostDocument> {
    constructor(
        @InjectModel(Post.name) postModel: SoftDeleteModel<PostDocument>,
    ) {
        super(postModel);
    }
}
