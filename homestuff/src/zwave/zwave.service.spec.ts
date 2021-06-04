import { Test, TestingModule } from '@nestjs/testing';
import { ZwaveService } from './zwave.service';

describe('ZwaveService', () => {
  let service: ZwaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZwaveService],
    }).compile();

    service = module.get<ZwaveService>(ZwaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
