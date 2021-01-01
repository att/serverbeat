import { NoAuthService } from './no-auth.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [NoAuthService]
})
export class NoAuthModule {}
