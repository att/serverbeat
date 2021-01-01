import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth/auth.service';

@Injectable()
export class NoAuthService extends AuthService {
    constructor() {
        super();
    }
    async isAuthenticated(cookie?: any): Promise<boolean> {
        return true;
    }
}
