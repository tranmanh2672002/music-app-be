import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from 'src/common/constants';
import { Document, Types, SchemaTypes } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import MongooseDelete from 'mongoose-delete';

export type PlaylistDocument = Playlist & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.PLAYLISTS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class Playlist extends MongoBaseSchema {
    @Prop({
        required: true,
        type: String,
    })
    name: string;
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        ref: MongoCollection.USERS,
    })
    userId: Types.ObjectId;
    @Prop({
        required: true,
        type: [SchemaTypes.ObjectId],
        ref: MongoCollection.SONGS,
    })
    songIds: Types.ObjectId[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

PlaylistSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
