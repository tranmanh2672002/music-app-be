import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from 'src/common/constants';
import { Document } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import MongooseDelete from 'mongoose-delete';

export type SongDocument = Song & Document;

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
    collection: MongoCollection.SONGS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class Song extends MongoBaseSchema {
    @Prop({
        required: true,
        type: String,
    })
    name: string;

    @Prop({
        required: true,
        type: String,
    })
    youtubeId: string;

    @Prop({
        required: true,
        type: [ThumbnailSchema],
    })
    thumbnails: Thumbnail[];

    @Prop({
        required: true,
        type: String,
    })
    artist: string;
}
export const SongSchema = SchemaFactory.createForClass(Song);

SongSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
