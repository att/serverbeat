import { AuthGuard } from './auth.guard';
import { GatekeeperService } from '../att-eshr/gatekeeper/gatekeeper.service';

describe('AuthGuard', () => {
    it('should be defined', () => {
        const authService = new GatekeeperService();
        expect(new AuthGuard(authService)).toBeDefined();
    });
    describe('canActivate', () => {
        it('should be defined', () => {
            const authService = new GatekeeperService();
            const authGaurd = new AuthGuard(authService);
            const cookie = {'attESHr': 'Steve|Smith|s.smith@att.com|s.smith' };
            return expect(authGaurd.canActivate(null)).resolves.toBeFalsy();
        });
    });
});
