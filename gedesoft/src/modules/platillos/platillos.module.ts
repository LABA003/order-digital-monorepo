import { Module } from '@nestjs/common';
import { PlatillosService } from './platillos.service';
import { PlatillosController } from './platillos.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PlatillosController],
  providers: [PlatillosService, PrismaService],
})
export class PlatillosModule {}
