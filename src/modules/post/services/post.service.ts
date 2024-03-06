import { IPostListQuery, IPostUpdate, POST_TYPE } from './../post.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { MODULE_NAME } from '../post.constant';
import { PostRepo } from '@/repositories/post.repo';
import { IPostCreate } from '../post.interface';
import { MusicService } from '@/modules/music/services/music.youtube.service';
import { OrderDirection } from '@/common/constants';
import { FilterQuery, PipelineStage } from 'mongoose';
import { Post } from '@/mongo-schemas/post.schema';
import { get } from 'lodash';

@Injectable()
export class PostService {
    constructor(
        private readonly configService: ConfigService,
        private readonly postRepo: PostRepo,
        private readonly musicService: MusicService,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getList(params: IPostListQuery) {
        try {
            const { orderBy, orderDirection, page, limit } = params;
            const filter: FilterQuery<Post> = { $and: [] };
            if (params.keyword) {
                filter.$and.push({
                    $or: [
                        {
                            name: {
                                $regex: `.*${params.keyword}.*`,
                                $options: 'i',
                            },
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: '$value' },
                                    regex: params.keyword,
                                    options: 'i',
                                },
                            },
                        },
                    ],
                });
            }
            if (!filter.$and.length) {
                delete filter.$and;
            }
            const query: PipelineStage[] = [
                { $match: filter },
                {
                    $facet: {
                        data: [
                            {
                                $sort: {
                                    [orderBy]:
                                        orderDirection === OrderDirection.ASC
                                            ? 1
                                            : -1,
                                },
                            },
                            { $skip: (+page - 1) * +limit },
                            { $limit: +limit },
                        ],
                        total: [{ $count: 'count' }],
                    },
                },
            ];
            const [data] = await this.postRepo.aggregate(query).exec();
            const items = get(data, 'data', []);
            const totalItems = get(data, 'total.0.count', 0) ?? 0;
            return { items, totalItems };
        } catch (error) {
            this.logger.error('Error get list in post service', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const post = await this.postRepo.findOne({ _id: id });
            return post;
        } catch (error) {
            this.logger.error('Error getById in post service', error);
            throw error;
        }
    }

    async getByUserId(id: string) {
        try {
            const post = await this.postRepo.find({ userId: id });
            return post;
        } catch (error) {
            this.logger.error('Error getById in post service', error);
            throw error;
        }
    }

    async create(data: IPostCreate, userId: string) {
        try {
            let song;
            if (data.type === POST_TYPE.SONG) {
                const res = await this.musicService.getDetail(data.musicId);
                song = {
                    musicId: data.musicId,
                    title: res?.title,
                    artist: res?.artist,
                    thumbnails: res?.thumbnails,
                    viewCount: res?.viewCount,
                };
            }
            const post = await this.postRepo.create({
                ...data,
                song,
                userId,
            });
            return post;
        } catch (error) {
            this.logger.error('Error create in post service', error);
            throw error;
        }
    }

    async update(data: IPostUpdate, id: string) {
        try {
            const res = await this.postRepo.findByIdAndUpdate(id, data);
            return res;
        } catch (error) {
            this.logger.error('Error update in post service', error);
            throw error;
        }
    }

    async updateUserLike(id: string, userId: string) {
        try {
            const post = await this.postRepo.findById(id);
            if (post?.userLikes?.includes(userId)) {
                const post = await this.postRepo.findByIdAndUpdate(id, {
                    $pull: { userLikes: userId },
                });
                return post.userLikes;
            } else {
                const post = await this.postRepo.findByIdAndUpdate(
                    id,
                    { $addToSet: { userLikes: userId } },
                    { new: true },
                );
                return post.userLikes;
            }
        } catch (error) {
            this.logger.error('Error updateUserLike in post service', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.postRepo.delete({ _id: id });
            return id;
        } catch (error) {
            this.logger.error('Error delete in post service', error);
            throw error;
        }
    }
}
