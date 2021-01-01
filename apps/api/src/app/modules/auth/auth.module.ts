import { Module, DynamicModule } from '@nestjs/common';
import { ModuleFactory } from '../module.factory';

@Module({
    providers: []
})
export class AuthModule {
    static NO_AUTH = 'no-auth';

    static forRoot(authType: string, userRoles: Array<string>): DynamicModule {
        return ModuleFactory.createModule(authType, userRoles);
    }
}
