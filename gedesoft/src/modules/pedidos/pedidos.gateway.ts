
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Pedido } from 'generated/prisma';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:4000'],
        methods: ['GET', 'POST'],
        credentials: true,
    }
})
export class PedidosGateway {
    @WebSocketServer()
    server: Server; // Esta es la "antena" de radio

    //  NO es una ruta HTTP. Es una función simple
    emitirNuevoPedido(pedido: Pedido) {
        // 'emit' significa "transmitir"
        this.server.emit('nuevo_pedido', pedido);
    }

    // 2. Escuchar el evento 'pedido_listo' (enviado por la Cocina/Mesero)
    /*@SubscribeMessage('pedido_listo')
    handlePedidoListo(@MessageBody() data: { pedidoId: number, mesa: number | string }) {
        // Este evento se reemite a todos los meseros
        this.server.emit('pedido_listo_notificacion', data);
    }*/
    @SubscribeMessage('pedido_listo_notificacion')
    handlePedidoListo(@MessageBody() payload: { pedidoId: number, mesa: any, categoria: string }, @ConnectedSocket() client: Socket) {
        // Simplemente retransmitimos el mensaje a todos (o a los meseros)
        this.server.emit('pedido_listo_notificacion', payload);
    }

    /*@SubscribeMessage('pedido_entregado_mesero')
    handlePedidoEntregado(@MessageBody() data: { pedidoId: number }) {
        // Retransmitimos el evento a todos (incluida la cocina)
        this.server.emit('pedido_finalizado_cocina', data);
    }*/
    @SubscribeMessage('pedido_entregado_mesero')
    handlePedidoEntregado(@MessageBody() data: { pedidoId: number }) {
        console.log(`Mesero entregó pedido #${data.pedidoId}. Avisando a cocina...`);

        // Le gritamos a la pantalla de COCINA que quite ese pedido
        this.server.emit('pedido_entregado_mesero', data);
    }

    @SubscribeMessage('item_individual_listo')
    handleItemListo(@MessageBody() data: any) {
        console.log(`🔔 Item listo: ${data.nombrePlatillo} (Mesa ${data.mesa})`);

        // Avisar a TODOS (especialmente a los meseros)
        this.server.emit('item_listo_notificacion', data);
    }
}