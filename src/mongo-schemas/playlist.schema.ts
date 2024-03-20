import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    DEFAULT_PLAYLIST_THUMBNAIL,
    MongoCollection,
} from 'src/common/constants';
import { Document, Types, SchemaTypes } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import MongooseDelete from 'mongoose-delete';
import { Song } from './song.schema';

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
        ref: User.name,
    })
    userId: Types.ObjectId;
    @Prop({
        required: true,
        type: [SchemaTypes.ObjectId],
        ref: Song.name,
        default: [],
    })
    songIds: Types.ObjectId[];
    @Prop({
        required: false,
        type: String,
        default: DEFAULT_PLAYLIST_THUMBNAIL,
    })
    thumbnail: string;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

PlaylistSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
