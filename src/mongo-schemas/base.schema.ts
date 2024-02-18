import { Prop } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
export class MongoBaseSchema {
    _id: ObjectId;

    @Prop({ required: false, default: null, type: Date })
    createdAt: Date;

    @Prop({ required: false, default: null, type: Date })
    updatedAt: Date;

    @Prop({ required: false, default: null, type: Date })
    deletedAt?: Date;

    @Prop({ required: false, default: null, type: Types.ObjectId })
    deletedBy?: ObjectId;

    @Prop({ required: false, default: null, type: Types.ObjectId })
    updatedBy: ObjectId;

    @Prop({ required: false, type: Types.ObjectId })
    createdBy: ObjectId;
}
