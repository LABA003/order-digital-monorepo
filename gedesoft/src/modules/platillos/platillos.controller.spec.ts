import { Test, TestingModule } from '@nestjs/testing';
import { PlatillosController } from './platillos.controller';
import { PlatillosService } from './platillos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatillosController', () => {
  let controller: PlatillosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatillosController],
        providers: [PlatillosService, PrismaService],
    }).compile();

    controller = module.get<PlatillosController>(PlatillosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
