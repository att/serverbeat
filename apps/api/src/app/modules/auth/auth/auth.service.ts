export abstract class AuthService {
    abstract async isAuthenticated(cookie?: any): Promise<boolean>;
}
