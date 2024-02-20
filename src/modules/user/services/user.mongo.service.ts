import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    OrderDirection,
    softDeleteCondition,
} from 'src/common/constants';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { User, UserDocument } from 'src/mongo-schemas/user.schema';
import {
    MODULE_NAME,
    SystemRole,
    SystemRoleFilter,
    userAttributes,
} from '../user.constant';
import {
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from '../user.interface';

@Injectable()
export class UserMongoService {
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getUserList(query: IUserListQuery) {
        try {
            const {
                page = +DEFAULT_FIRST_PAGE,
                limit = +DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                systemRole = SystemRoleFilter.ALL,
            } = query;
            const matchQuery = {
                $and: [
                    {
                        ...softDeleteCondition,
                    },
                    {
                        $or: [
                            {
                                name: {
                                    $regex: keyword,
                                    $options: 'i',
                                },
                            },
                            {
                                email: {
                                    $regex: keyword,
                                    $options: 'i',
                                },
                            },
                        ],
                    },
                    {
                        systemRole: {
                            $in:
                                systemRole !== SystemRoleFilter.ALL
                                    ? [systemRole]
                                    : Object.values(SystemRole),
                        },
                    },
                ],
            };

            const [result] = await this.userModel.aggregate([
                {
                    $match: {
                        ...matchQuery,
                    },
                },
                {
                    $facet: {
                        count: [{ $count: 'total' }],
                        data: [
                            {
                                $sort: {
                                    [orderBy]:
                                        orderDirection === OrderDirection.ASC
                                            ? 1
                                            : -1,
                                },
                            },
                            {
                                $skip: (page - 1) * limit,
                            },
                            {
                                $limit: Number(limit),
                            },
                        ],
                    },
                },
            ]);

            return {
                totalItems: result?.count?.[0]?.total || 0,
                items: result?.data || [],
            };
        } catch (error) {
            this.logger.error('Error in searchUsers service', error);
            throw error;
        }
    }

    async getUserByField(userAttributes: string[], field: string, value: any) {
        try {
            const user = await this.userModel
                .findOne({
                    ...softDeleteCondition,
                    [field]: value,
                })
                .select(userAttributes)
                .lean();
            return user;
        } catch (error) {
            this.logger.error('Error in getUserByField service', error);
            throw error;
        }
    }

    async getUserById(userAttributes: string[], id: ObjectId) {
        try {
            const user = await this.getUserByField(userAttributes, '_id', id);
            return user;
        } catch (error) {
            this.logger.error('Error in getUserById service', error);
            throw error;
        }
    }

    async getAllUsers(userAttributes: string[]) {
        try {
            const users = await this.userModel
                .find({ ...softDeleteCondition })
                .select(userAttributes)
                .lean();
            return users;
        } catch (error) {
            this.logger.error('Error in getAllUser service', error);
            throw error;
        }
    }

    async getUsersByIds(userAttributes: string[], ids: ObjectId[]) {
        try {
            const users = await this.userModel
                .find({
                    ...softDeleteCondition,
                    _id: { $in: ids },
                })
                .select(userAttributes);
            return users;
        } catch (error) {
            this.logger.error('Error in getUsersByIds service', error);
            throw error;
        }
    }

    async createUser(user: IUserCreateBody): Promise<UserDocument> {
        try {
            const newUser = new this.userModel(user);
            const insertedUser = await newUser.save();
            return insertedUser;
        } catch (error) {
            this.logger.error('Error in createUser service', error);
            throw error;
        }
    }

    async updateUser(id: ObjectId, user: IUserUpdateBody) {
        try {
            await this.userModel.updateOne({ _id: id }, user);
            const updatedUser = await this.getUserById(userAttributes, id);
            return updatedUser;
        } catch (error) {
            this.logger.error('Error in updateUser service', error);
            throw error;
        }
    }

    async deleteUser(id: ObjectId, deletedBy: ObjectId) {
        try {
            const body = { deletedAt: new Date(), deletedBy: deletedBy };
            await this.userModel.updateOne({ _id: id }, body);
        } catch (error) {
            this.logger.error('Error in deleteUser service', error);
            throw error;
        }
    }
}
