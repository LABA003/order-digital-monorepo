// toma-pedido.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { WebSocketService } from '../../../services/web-socket';
import { PedidosService } from '../../../services/pedidos';
import { PlatillosService } from '../../../services/platillos';
import { CreatePedidoDto, PedidoItemDto, Platillo, StatusPedido, UpdatePedidoDto } from '../../../core/interfaces/pedidos.interfaces';
import { TicketsService } from '../../../services/tickets';
import { ActivatedRoute, Router } from '@angular/router';

interface PedidoItemVM {
  idPlatillo: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-toma-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toma-pedido.html',
  styleUrl: './toma-pedido.scss',
})
export class TomaPedido implements OnInit {

  private platillosService = inject(PlatillosService);
  private pedidosService = inject(PedidosService);
  private webSocketService = inject(WebSocketService);
  private ticketsService = inject(TicketsService);
  private route = inject(ActivatedRoute);

  constructor(private router: Router) { }

  platillos: Platillo[] = [];
  platillosFiltrados: Platillo[] = [];
  categorias: string[] = ['todos', 'ENTRADA', 'PLATO_FUERTE', 'BEBIDA', 'POSTRE', 'OTRO'];
  categoriaSeleccionada = 'todos';

  pedidoActual: PedidoItemVM[] = [];
  totalPedido = 0;
  numMesa: number = 1;
  idPedidoActivo: number | null = null;
  statusMesa: string = 'Por favor selecciona una mesa';

  notificacion: string | null = null;
  enviandoPedido = false;

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarMenu();
      this.escucharPedidosListos();
      this.route.paramMap.subscribe(params => {
        const mesaUrl = params.get('numMesa');
        if (mesaUrl) {
          this.numMesa = +mesaUrl;
          this.buscarPedidoAbierto();
        }
      });
    }
  }

  cargarMenu() {
    this.platillosService.obtenerPlatillos().subscribe((data: Platillo[]) => {
      this.platillos = data;
      this.filtrarCategoria('todos');
    });
  }

  escucharPedidosListos() {
    this.webSocketService.listen('pedido_listo_notificacion').subscribe((data: any) => {
      this.mostrarNotificacion(`Mesa ${data.mesa}: ${data.categoria} listo.`);
    });
  }

  volverAlDashboard() {
    this.router.navigate(['/mesero']);
  }

  filtrarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'todos') {
      this.platillosFiltrados = this.platillos;
    } else {
      this.platillosFiltrados = this.platillos.filter(p => p.categoria === categoria);
    }
  }

  buscarPedidoAbierto() {
    if (!this.numMesa || this.numMesa <= 0) {
      this.statusMesa = 'Número de mesa inválido.';
      return;
    }

    this.idPedidoActivo = null;
    this.limpiarPedido();
    this.statusMesa = `Buscando pedidos para Mesa ${this.numMesa}...`;

    this.pedidosService.obtenerTodos().subscribe(todosLosPedidos => {
      // VALIDACIÓN CRÍTICA:
      // Buscamos pedido de esta mesa que NO esté cancelado Y NO TENGA TICKET.
      const pedidoAbierto = todosLosPedidos.find((p: any) =>
        p.numMesa === this.numMesa && 
        p.status !== 'CANCELADO' && 
        !p.ticket // <--- ESTA ES LA CLAVE para no cargar pedidos cobrados
      );

      if (pedidoAbierto) {
        this.idPedidoActivo = pedidoAbierto.idPedido;
        this.statusMesa = `✅ Añadiendo a Pedido #${this.idPedidoActivo} (Mesa ${this.numMesa})`;
      } else {
        this.statusMesa = `📝 Creando NUEVO pedido para Mesa ${this.numMesa}`;
      }
    });
  }

  agregarAPedido(platillo: Platillo) {
    const itemExistente = this.pedidoActual.find(item => item.idPlatillo === platillo.idPlatillo);

    if (itemExistente) {
      this.incrementarCantidad(itemExistente);
    } else {
      this.pedidoActual.push({
        idPlatillo: platillo.idPlatillo,
        nombre: platillo.nombrePlatillo,
        precio: platillo.precio,
        cantidad: 1
      });
      this.calcularTotal();
    }
  }

  quitarDePedido(item: PedidoItemVM) {
    item.cantidad--;
    if (item.cantidad === 0) {
      this.pedidoActual = this.pedidoActual.filter(p => p.idPlatillo !== item.idPlatillo);
    }
    this.calcularTotal();
  }

  incrementarCantidad(item: PedidoItemVM) {
    item.cantidad++;
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalPedido = this.pedidoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  enviarPedido() {
    if (this.pedidoActual.length === 0 || this.enviandoPedido) return;
    if (!this.numMesa || this.numMesa <= 0) {
      this.mostrarNotificacion('Error: Ingresa un número de mesa válido.');
      return;
    }

    this.enviandoPedido = true;
    const itemsParaDto: PedidoItemDto[] = this.pedidoActual.map(item => ({
      idPlatillo: item.idPlatillo,
      cantidad: item.cantidad
    }));

    if (this.idPedidoActivo) {
      const updateDto: UpdatePedidoDto = { items: itemsParaDto };
      this.pedidosService.agregarPlatillos(this.idPedidoActivo, updateDto).subscribe({
        next: (res) => {
          this.mostrarNotificacion(`Items añadidos al Pedido #${res.pedido.idPedido}`);
          this.limpiarPedido(); 
          this.enviandoPedido = false;
        },
        error: (err) => {
          console.error('Error al añadir:', err);
          this.mostrarNotificacion('Error al añadir items.');
          this.enviandoPedido = false;
        }
      });
    } else {
      const createDto: CreatePedidoDto = {
        numMesa: this.numMesa,
        items: itemsParaDto
      };
      this.pedidosService.crearPedido(createDto).subscribe({
        next: (res) => {
          this.idPedidoActivo = res.pedido.idPedido;
          this.statusMesa = `✅ Añadiendo a Pedido #${this.idPedidoActivo} (Mesa ${this.numMesa})`;
          this.mostrarNotificacion(`Pedido #${res.pedido.idPedido} creado.`);
          this.limpiarPedido(); 
          this.enviandoPedido = false;
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.mostrarNotificacion('Error al crear el pedido.');
          this.enviandoPedido = false;
        }
      });
    }
  }

  limpiarPedido() {
    this.pedidoActual = [];
    this.totalPedido = 0;
  }

  mostrarNotificacion(mensaje: string) {
    this.notificacion = mensaje;
    setTimeout(() => {
      this.notificacion = null;
    }, 4000);
  }

  cerrarCuenta() {
    if (!this.idPedidoActivo) {
      this.mostrarNotificacion('No hay ningún pedido activo.');
      return;
    }
    if (confirm('¿Deseas cerrar la cuenta y generar el ticket?')) {
      this.ticketsService.generarTicket(this.idPedidoActivo, 'EFECTIVO').subscribe({
        next: (res) => {
          this.mostrarNotificacion('Ticket generado y enviado a Caja');
          this.limpiarPedido();
          this.idPedidoActivo = null;
          this.statusMesa = 'Mesa Libre (Ticket generado)';
          setTimeout(() => this.router.navigate(['/mesero']), 1500);
        },
        error: (err) => {
          console.error('Error:', err);
          this.mostrarNotificacion('Error al generar el ticket');
        }
      });
    }
  }

  eliminarPlatillo(item: any) {
    if (!this.idPedidoActivo) {
      this.pedidoActual = this.pedidoActual.filter(p => p.idPlatillo !== item.idPlatillo);
      this.calcularTotal();
      return;
    }
    if (confirm(`¿Eliminar ${item.nombre} del pedido de cocina?`)) {
      this.pedidosService.eliminarPlatillos(this.idPedidoActivo, { idPlatillos: item.idPlatillo })
        .subscribe({
          next: () => {
            this.mostrarNotificacion('Platillo eliminado');
            this.buscarPedidoAbierto(); 
          },
          error: (err) => alert('No se puede eliminar: Quizás ya lo están preparando.')
        });
    }
  }
}
