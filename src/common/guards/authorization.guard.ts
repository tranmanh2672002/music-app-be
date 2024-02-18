import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    async canActivate(): Promise<boolean> {
        return true;
    }
}
