// cocina-view.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PedidosService } from '../../../services/pedidos';
import { WebSocketService } from '../../../services/web-socket';
import { Pedido, StatusPedido } from '../../../core/interfaces/pedidos.interfaces';
import { TicketsService } from '../../../services/tickets';

@Component({
  selector: 'app-cocina-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocina-view.html',
  styleUrl: './cocina-view.scss',
})
export class CocinaView implements OnInit, OnDestroy {
  // Inyecciones
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidosService = inject(PedidosService);
  private webSocketService = inject(WebSocketService);
  private ticketsService = inject(TicketsService);
  private cdr = inject(ChangeDetectorRef);

  // Estado
  categoriaPantalla: string = '';

  // Listas de pedidos por columna
  pedidosNuevos: Pedido[] = [];
  pedidosEnPrep: Pedido[] = [];
  pedidosListos: Pedido[] = [];

  // Suscripciones
  private routeSub: Subscription | undefined;
  private socketSub: Subscription = new Subscription();

  // Configuración de categorías
  categorias = [
    { url: 'entrada', backend: 'ENTRADA', label: 'Entradas' },
    { url: 'plato_fuerte', backend: 'PLATO_FUERTE', label: 'Platos Fuertes' },
    { url: 'postre', backend: 'POSTRE', label: 'Postres' },
    { url: 'bebida', backend: 'BEBIDA', label: 'Bebidas' }
  ];

  // Constantes de estado
  readonly ESTADO_NUEVO = 'PENDIENTE';
  readonly ESTADO_LISTO = 'LISTO';
  readonly ESTADO_ENTREGADO = 'ENTREGADO';
  readonly ESTADO_CANCELADO = 'CANCELADO';

  // Mapas locales de estado visual
  itemsTerminadosMap: Set<string> = new Set();

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const raw = params['categoria'] || '';
      this.categoriaPantalla = raw.toString().toUpperCase().replace(/-/g, '_');
      if (isPlatformBrowser(this.platformId)) {
        this.recargarTodo();
      }
    });

    // 1. Escuchar Nuevo Pedido
    const subNuevo = this.webSocketService.listen('nuevo_pedido').subscribe((pedido: Pedido) => {
      console.log('🔔 Socket Cocina: Nuevo Pedido', pedido);
      this.procesarPedido(pedido);
      this.cdr.detectChanges();
    });
    this.socketSub.add(subNuevo);

    // 2. Escuchar cuando Mesero recoge (limpia la pantalla visualmente) — ahora con categoria
    const subFinalizado = this.webSocketService.listen('pedido_entregado_mesero').subscribe((data: any) => {
      // Sólo actuamos si la recogida corresponde a nuestra pantalla
      if (data?.categoria && data.categoria !== this.categoriaPantalla) {
        return;
      }
      console.log('✅ Socket Cocina: Mesero recogió', data.pedidoId, 'categoria', data.categoria);
      this.removerPedidoDePantalla(data.pedidoId, data.categoria);
      this.cdr.detectChanges();
    });
    this.socketSub.add(subFinalizado);

    // 3. Escuchar notificaciones de "listo" (si la notificación es para esta categoría la procesamos)
    const subListo = this.webSocketService.listen('pedido_listo_notificacion').subscribe((data: any) => {
      if (data?.categoria && data.categoria !== this.categoriaPantalla) return;
      if (data?.pedidoId) {
        this.pedidosService.obtenerPedidoPorId(data.pedidoId).subscribe({
          next: (pedido) => this.procesarPedido(pedido),
          error: () => this.recargarTodo()
        });
      } else {
        this.recargarTodo();
      }
      this.cdr.detectChanges();
    });
    this.socketSub.add(subListo);
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.socketSub?.unsubscribe();
  }

  navegarACategoria(urlCategoria: string) {
    this.router.navigate(['/cocina', urlCategoria]);
  }

  recargarTodo() {
    this.limpiarColumnas();
    this.pedidosService.obtenerTodos().subscribe((pedidos: Pedido[]) => {
      pedidos.forEach(pedido => {
        this.procesarPedido(pedido);
      });
      this.cdr.detectChanges();
    });
  }

  procesarPedido(pedido: Pedido) {
    if (!pedido.detalles || pedido.detalles.length === 0) return;

    // Si ya está totalmente entregado o cancelado en BD, no lo mostramos
    const status = (pedido.status || '').toUpperCase();
    if (status === this.ESTADO_ENTREGADO || status === this.ESTADO_CANCELADO) {
      this.removerPedidoDePantalla(pedido.idPedido);
      return;
    }

    // Filtrar detalles que coincidan con la categoría actual
    const detallesFiltrados = pedido.detalles.filter(d =>
      this.esCategoriaCoincidente(d.platillo.categoria)
    );

    if (detallesFiltrados.length === 0) return;

    // Crear objeto visual solo con lo necesario
    const pedidoVisual: Pedido = {
      ...pedido,
      detalles: detallesFiltrados
    };

    // Buscar si ya lo tenemos en pantalla
    const pedidoExistente = this.pedidosNuevos.find(p => p.idPedido === pedido.idPedido) ||
                            this.pedidosEnPrep.find(p => p.idPedido === pedido.idPedido) ||
                            this.pedidosListos.find(p => p.idPedido === pedido.idPedido);

    let cantidadAnterior = 0;
    if (pedidoExistente) {
      cantidadAnterior = pedidoExistente.detalles.reduce((sum, d) => sum + d.cantidad, 0);
    }
    const cantidadNueva = pedidoVisual.detalles.reduce((sum, d) => sum + d.cantidad, 0);

    // Consultar memoria local para saber en qué columna ponerlo
    let estadoLocal = this.obtenerEstadoLocal(pedido.idPedido);

    // 🔥 FIX: Si el mesero agregó MÁS cantidad a esta cuenta, debemos devolverla a 'Nuevos' para que la cocina se entere
    if (cantidadNueva > cantidadAnterior && pedidoExistente) {
      estadoLocal = null;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(`estado_p${pedido.idPedido}_${this.categoriaPantalla}`);
      }
    }

    // Limpiar previo para evitar duplicados (Upsert)
    this.removerPedidoDePantalla(pedidoVisual.idPedido, this.categoriaPantalla);

    // Asignación a columnas
    if (estadoLocal === 'LISTO') {
      this.pedidosListos = [...this.pedidosListos, pedidoVisual];
    }
    else if (estadoLocal === 'PREP') {
      this.pedidosEnPrep = [...this.pedidosEnPrep, pedidoVisual];
    }
    else {
      // Por defecto a Nuevos
      this.pedidosNuevos = [...this.pedidosNuevos, pedidoVisual];
    }
  }

  removerPedidoDePantalla(idPedido: number, categoria?: string) {
    // Si se provee categoría, solo removemos pedidos de esa categoría (evita borrar el pedido completo en otras pantallas)
    if (categoria) {
      this.pedidosNuevos = this.pedidosNuevos.filter(p => !(p.idPedido === idPedido));
      this.pedidosEnPrep = this.pedidosEnPrep.filter(p => !(p.idPedido === idPedido));
      this.pedidosListos = this.pedidosListos.filter(p => !(p.idPedido === idPedido));
      return;
    }

    // Fallback: remover por id en todas las columnas
    this.pedidosNuevos = this.pedidosNuevos.filter(p => p.idPedido !== idPedido);
    this.pedidosEnPrep = this.pedidosEnPrep.filter(p => p.idPedido !== idPedido);
    this.pedidosListos = this.pedidosListos.filter(p => p.idPedido !== idPedido);
  }

  esCategoriaCoincidente(itemCategoria: string): boolean {
    return itemCategoria === this.categoriaPantalla;
  }

  limpiarColumnas() {
    this.pedidosNuevos = [];
    this.pedidosEnPrep = [];
    this.pedidosListos = [];
  }

  // --- CHECKLIST ---
  toggleItemCheck(idPedido: number, idPlatillo: number) {
    const key = `${idPedido}-${idPlatillo}`;
    if (this.itemsTerminadosMap.has(key)) {
      this.itemsTerminadosMap.delete(key);
    } else {
      this.itemsTerminadosMap.add(key);
    }
  }

  isItemChecked(idPedido: number, idPlatillo: number): boolean {
    return this.itemsTerminadosMap.has(`${idPedido}-${idPlatillo}`);
  }

  estaTodoLoMioListo(pedido: Pedido): boolean {
    return pedido.detalles.every(d =>
      this.itemsTerminadosMap.has(`${pedido.idPedido}-${d.idPlatillo}`)
    );
  }

  // --- ACCIONES ---
  moverAEnPreparacion(pedido: Pedido) {
    this.guardarEstadoLocal(pedido.idPedido, 'PREP');
    this.removerPedidoDePantalla(pedido.idPedido, this.categoriaPantalla);
    this.pedidosEnPrep = [...this.pedidosEnPrep, pedido];
  }

  moverAListo(pedido: Pedido) {
    // 1. Guardar estado localmente (para persistencia visual)
    this.guardarEstadoLocal(pedido.idPedido, 'LISTO');

    // 2. Mover visualmente
    this.removerPedidoDePantalla(pedido.idPedido, this.categoriaPantalla);
    this.pedidosListos = [...this.pedidosListos, pedido];

    // 3. Avisar al mesero via Socket usando el evento que escucha MeseroDashboard
    // NO actualizamos a 'ENTREGADO' en BD todavía para no borrar el pedido de las otras pantallas de cocina
    console.log(`Avisando a mesero: Pedido ${pedido.idPedido} listo en ${this.categoriaPantalla}`);
    this.webSocketService.emit('pedido_listo_notificacion', {
      pedidoId: pedido.idPedido,
      mesa: pedido.numMesa || 'Barra',
      categoria: this.categoriaPantalla,
      detalles: pedido.detalles
    });
  }

  cancelarPedido(pedido: Pedido) {
    if (!confirm('¿Cancelar pedido realmente?')) return;
    this.removerPedidoDePantalla(pedido.idPedido, this.categoriaPantalla);

    // Cancelar en BD
    this.pedidosService.actualizarEstadoPedido(pedido.idPedido, StatusPedido.CANCELADO).subscribe({
      next: () => {
        // Limpiar memoria local
        const key = `estado_p${pedido.idPedido}_${this.categoriaPantalla}`;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem(key);
        }
      },
      error: () => {
        // Rollback si falla
        this.pedidosNuevos = [...this.pedidosNuevos, pedido];
      }
    });
  }

  // --- LOCALSTORAGE ---
  private platformId = inject(PLATFORM_ID);

  private guardarEstadoLocal(idPedido: number, estado: 'PREP' | 'LISTO') {
    if (!isPlatformBrowser(this.platformId)) return;
    const key = `estado_p${idPedido}_${this.categoriaPantalla}`;
    localStorage.setItem(key, estado);
  }

  private obtenerEstadoLocal(idPedido: number): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const key = `estado_p${idPedido}_${this.categoriaPantalla}`;
    return localStorage.getItem(key);
  }
}
