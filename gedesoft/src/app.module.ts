import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';

import { PlatillosService } from './modules/platillos/platillos.service';
import { PlatillosModule } from './modules/platillos/platillos.module';
import { TicketsService } from './modules/tickets/tickets.service';
import { TicketsModule } from './modules/tickets/tickets.module';
import { PedidosController } from './modules/pedidos/pedidos.controller';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PedidosService } from './modules/pedidos/pedidos.service';
import { AppController } from './app.controller';
import { PedidosGateway } from './modules/pedidos/pedidos.gateway';
import { TicketsGateway } from './modules/tickets/tickets.gateway';


@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    UsuariosModule,
    AuthModule,

    PlatillosModule,
    TicketsModule,
    PedidosModule,
  ],
  providers: [
    PlatillosService, 
    TicketsService, 
    PedidosService,
    PedidosGateway,
    TicketsGateway
  ],
  controllers: [PedidosController, AppController],

})
export class AppModule {}
