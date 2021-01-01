import { AuthService } from './auth/auth/auth.service';
import { NoAuthService } from './no-auth/no-auth.service';
import { NoAuthModule } from './no-auth/no-auth.module';

export class ModuleFactory {
    static createModule(authType: string, userRoles: Array<string>): any {
        if (authType === 'no-auth') {
            return {
                module: NoAuthModule,
                providers: [{ provide: AuthService, useClass: NoAuthService }],
                exports: [{ provide: AuthService, useClass: NoAuthService }]
            };
        } else {
            throw Error('not supported!');
        }
    }
}
