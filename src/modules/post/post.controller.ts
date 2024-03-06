import { AuthenticationGuard } from './../../common/guards/authentication.guard';
import { IPostCreate } from './post.interface';
import {
    Controller,
    Get,
    Post,
    InternalServerErrorException,
    Query,
    Body,
    Req,
    UseGuards,
    Delete,
    Param,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { postCreateSchema } from './post.validator';
import { PostService } from './services/post.service';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { HttpStatus } from '@/common/constants';
import { UserRepo } from '@/repositories/user.repo';

@UseGuards(AuthenticationGuard)
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly userRepo: UserRepo,
    ) {}

    @Get('/get-list')
    async getList(@Req() req) {
        try {
            const posts = await this.postService.getList();
            return new SuccessResponse(posts);
        } catch (error) {
            return new InternalServerErrorException(error);
        }
    }

    @Get('/get/:id/detail')
    async getDetail(@Param('id') id) {
        try {
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

    @Delete('/delete/:id')
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
