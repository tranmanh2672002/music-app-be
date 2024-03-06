import { AuthenticationGuard } from './../../common/guards/authentication.guard';
import { IPostCreate, IPostListQuery, IPostUpdate } from './post.interface';
import {
    Controller,
    Get,
    Post,
    InternalServerErrorException,
    Body,
    Req,
    UseGuards,
    Delete,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import {
    postCreateSchema,
    postQuerySchema,
    postUpdateSchema,
} from './post.validator';
import { PostService } from './services/post.service';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { HttpStatus } from '@/common/constants';
import { UserRepo } from '@/repositories/user.repo';
import { PostRepo } from '@/repositories/post.repo';

@UseGuards(AuthenticationGuard)
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly userRepo: UserRepo,
        private readonly postRepo: PostRepo,
    ) {}

    @Get('/list-new')
    async getList(
        @Query(new JoiValidationPipe(postQuerySchema))
        query: IPostListQuery,
    ) {
        try {
            const posts = await this.postService.getList(query);
            return new SuccessResponse(posts);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/my-post')
    async getMyPost(@Req() req) {
        try {
            const userId = req?.loginUser?._id;
            const isExisted = await this.userRepo.existedById(userId);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'User not found',
                    [],
                );
            }
            const posts = await this.postService.getByUserId(userId);
            return new SuccessResponse(posts);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/list/:id')
    async getListByUserId(@Param('id') id) {
        try {
            const isExisted = await this.userRepo.existedById(id);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'User not found',
                    [],
                );
            }
            const posts = await this.postService.getByUserId(id);
            return new SuccessResponse(posts);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    async getDetail(@Param('id') id) {
        try {
            const isExisted = await this.postRepo.existedById(id);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Post not found',
                    [],
                );
            }
            const post = await this.postService.getById(id);
            return new SuccessResponse(post);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Post('/create')
    async create(
        @Req() req,
        @Body(new JoiValidationPipe(postCreateSchema))
        body: IPostCreate,
    ) {
        try {
            const userId = req?.loginUser?._id;
            const isExisted = await this.userRepo.existedById(userId);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'User not found',
                    [],
                );
            }
            const post = await this.postService.create(body, userId);
            return new SuccessResponse(post);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/:id')
    async update(
        @Param('id')
        id: string,
        @Body(new JoiValidationPipe(postUpdateSchema))
        body: IPostUpdate,
    ) {
        try {
            const isExisted = await this.postRepo.existedById(id);
            if (!isExisted) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Post not found',
                    [],
                );
            }
            const post = await this.postService.update(body, id);
            return new SuccessResponse(post);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    async delete(
        @Param('id')
        id: string,
    ) {
        try {
            const post = await this.postService.getById(id);
            if (!post) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    'Song not exists',
                    [],
                );
            }
            await this.postService.delete(id);
            return new SuccessResponse({ id });
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }
}
