import { Test, TestingModule } from '@nestjs/testing';
import { PlatillosService } from './platillos.service';
import { PlatillosController } from './platillos.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatillosService', () => {
  let service: PlatillosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatillosController],
        providers: [PlatillosService, PrismaService],
    }).compile();

    service = module.get<PlatillosService>(PlatillosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
