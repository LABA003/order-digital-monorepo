import { Component, inject, OnInit } from '@angular/core';
import { WebSocketService } from '../../services/web-socket';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cocina',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './cocina.html',
  styleUrl: './cocina.scss',
})
export class Cocina  implements OnInit{
 private webSocketService = inject(WebSocketService);
  public pedidos: any[] = [];

  ngOnInit() {
    // Escucha el evento 'nuevo_pedido' del backend
    this.webSocketService.listen('nuevo_pedido').subscribe(
      (pedido) => {
        // Filtra si es de esta cocina (plato fuerte, bebida, etc.)
        if (pedido.categoria === 'plato_fuerte') {
          this.pedidos.push(pedido);
        }
      }
    );
  }

  marcarComoListo(pedido: any) {
    // ... Lógica para actualizar el pedido
    
    // Emite el evento 'pedido_listo' de vuelta al servidor
    this.webSocketService.emit('pedido_listo', { pedidoId: pedido.id });
  }
}
