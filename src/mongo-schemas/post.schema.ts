import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from 'src/common/constants';
import { Document, Types } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import { SchemaTypes } from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import { Playlist } from './playlist.schema';
import { User } from './user.schema';

export type PostDocument = Post & Document;

@Schema({
    _id: false,
})
export class Thumbnail {
    @Prop({
        required: true,
        type: String,
    })
    url: string;

    @Prop({
        required: true,
        type: Number,
    })
    width: number;

    @Prop({
        required: true,
        type: Number,
    })
    height: number;
}
export const ThumbnailSchema = SchemaFactory.createForClass(Thumbnail);

@Schema({
    timestamps: true,
    collection: MongoCollection.POSTS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class Post extends MongoBaseSchema {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        ref: User.name,
    })
    userId: Types.ObjectId;

    @Prop({
        required: false,
        type: String,
    })
    description: string;

    @Prop({
        required: false,
        type: String,
    })
    type: string;

    @Prop({
        required: false,
        type: Object,
    })
    song: any;

    @Prop({
        required: false,
        type: SchemaTypes.ObjectId,
        ref: Playlist.name,
    })
    playlistId: Types.ObjectId;

    @Prop({
        required: false,
        type: [SchemaTypes.ObjectId],
        ref: User.name,
        default: [],
    })
    userLikes: Types.ObjectId[];
}
export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
