import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from 'src/common/constants';
import { Document, Types, SchemaTypes } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import MongooseDelete from 'mongoose-delete';

export type ListenRecentlyDocument = ListenRecently & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.LISTEN_RECENTLY,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class ListenRecently extends MongoBaseSchema {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        ref: MongoCollection.USERS,
    })
    userId: Types.ObjectId;
    @Prop({
        required: true,
        type: [String],
        default: [],
    })
    songIds: string[];
}

export const ListenRecentlySchema =
    SchemaFactory.createForClass(ListenRecently);

ListenRecentlySchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
