import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const cookie = context.getArgs()[0]
            ? context.getArgs()[0]['cookies']
            : null;
        return await this.authService.isAuthenticated(cookie);
    }
}
