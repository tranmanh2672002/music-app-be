import { SoftDeleteModel } from 'mongoose-delete';
import { BaseRepository } from './base.repo';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/mongo-schemas/user.schema';

export class UserRepo extends BaseRepository<UserDocument> {
    constructor(
        @InjectModel(User.name) userModel: SoftDeleteModel<UserDocument>,
    ) {
        super(userModel);
    }
}
