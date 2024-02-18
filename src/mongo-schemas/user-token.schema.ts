import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from 'src/common/constants';
import { Document, SchemaTypes, Types } from 'mongoose';
import { MongoBaseSchema } from './base.schema';
import { UserTokenType } from '@/modules/auth/auth.constant';
import MongooseDelete from 'mongoose-delete';
export type UserTokenDocument = UserToken & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_TOKENS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
})
export class UserToken extends MongoBaseSchema {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @Prop({
        required: true,
        type: String,
        trim: true,
    })
    token: string;

    @Prop({
        required: true,
        type: String,
        trim: true,
    })
    hashToken: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(UserTokenType),
    })
    type: string;
}
export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

UserTokenSchema.plugin(MongooseDelete, {
    deletedBy: true,
    deletedByType: String,
    overrideMethods: 'all',
});
