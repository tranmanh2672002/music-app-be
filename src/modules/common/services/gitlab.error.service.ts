import { HttpStatus } from '@/common/constants';
import { GitlabServiceErrorResponse } from '@/common/helpers/response';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class GitlabErrorService {
    constructor(private readonly i18n: I18nService) {
        //
    }
    handleGitlabError(error) {
        const errorCode = error?.response?.status;
        let _error;
        switch (errorCode) {
            case HttpStatus.UNAUTHORIZED:
                _error = {
                    key: null,
                    errorCode: HttpStatus.UNAUTHORIZED,
                    message: this.i18n.t('gitlab.invalidGitToken'),
                };
                break;
            case HttpStatus.NOT_FOUND:
                _error = {
                    key: null,
                    errorCode: HttpStatus.ITEM_NOT_FOUND,
                    message: this.i18n.t('gitlab.invalidGitInformation'),
                };
                break;
            case HttpStatus.CONFLICT:
                _error = {
                    key: null,
                    errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                    message: this.i18n.t('errors.445'),
                };
                break;
            default:
                _error = {
                    key: null,
                    errorCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: this.i18n.t('errors.500'),
                };
        }
        return new GitlabServiceErrorResponse(_error);
    }
}
