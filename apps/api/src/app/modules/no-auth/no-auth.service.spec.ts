import { Test, TestingModule } from '@nestjs/testing';
import { NoAuthService } from './no-auth.service';

describe('NoAuthService', () => {
  let service: NoAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoAuthService],
    }).compile();

    service = module.get<NoAuthService>(NoAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
