import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { INPUT_TEXT_MAX_LENGTH, MongoCollection } from 'src/common/constants';
import { Document } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import MongooseDelete from 'mongoose-delete';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USERS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class User extends MongoBaseSchema {
    @Prop({
        required: true,
        type: String,
    })
    provider: string;
    @Prop({
        required: true,
        type: String,
        maxLength: INPUT_TEXT_MAX_LENGTH,
        trim: true,
    })
    email: string;
    @Prop({
        required: false,
        type: String,
    })
    password: string;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
