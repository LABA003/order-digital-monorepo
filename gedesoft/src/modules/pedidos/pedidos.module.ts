import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../guards/roles.guard';
import { PedidosGateway } from './pedidos.gateway';

@Module({
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    PedidosGateway,
  ],
})
export class PedidosModule {}
