// dashboard.ts (MeseroDashboard)
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../services/web-socket';
import { PedidosService } from '../../../services/pedidos';
import { TicketsService } from '../../../services/tickets';
import { StatusPedido } from '../../../core/interfaces/pedidos.interfaces';
import { Subscription } from 'rxjs';

interface MesaView {
  numero: number;
  pedidoActivo?: any; // Objeto del pedido, si existe
  total: number;
}

@Component({
  selector: 'app-mesero-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class MeseroDashboard implements OnInit, OnDestroy {

  // Inyecciones
  private router = inject(Router);
  private socketService = inject(WebSocketService);
  private pedidosService = inject(PedidosService);
  private ticketsService = inject(TicketsService);
  private cdr = inject(ChangeDetectorRef);

  // Datos
  pedidosListos: any[] = [];
  mesas: MesaView[] = [];
  mesaSeleccionada: MesaView | null = null;
  notificacionReciente: any = null;

  // Control de Suscripciones
  private socketSub: Subscription | undefined;

  // Anti-rebote
  private ultimasNotificaciones = new Map<string, number>();

  // Configuración
  TOTAL_MESAS = 10;

  ngOnInit() {
    this.cargarPedidosListosDeCache();
    this.inicializarMesas();
    this.cargarEstadoMesas();
    this.escucharSockets();
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  inicializarMesas() {
    this.mesas = Array.from({ length: this.TOTAL_MESAS }, (_, i) => ({
      numero: i + 1,
      total: 0
    }));
  }

  cargarEstadoMesas() {
    this.pedidosService.obtenerTodos().subscribe({
      next: (pedidos) => {
        this.inicializarMesas();
        const idsRecogidos = this.obtenerIdsRecogidos();

        pedidos.forEach((p: any) => {
          // --- LÓGICA DE MESAS (Ocupada si no tiene ticket y no está cancelado) ---
          if (p.status !== 'CANCELADO' && !p.ticket) {
            const mesaIndex = this.mesas.findIndex(m => m.numero === p.numMesa);
            if (mesaIndex !== -1) {
              const total = p.detalles?.reduce((acc: number, item: any) =>
                acc + (item.cantidad * item.platillo.precio), 0) || 0;

              this.mesas[mesaIndex].pedidoActivo = p;
              this.mesas[mesaIndex].total = total;
            }
          }

          // --- LÓGICA DE ALERTAS (Recuperar persistencia) ---
          if ((p.status === 'ENTREGADO' || p.status === 'LISTO') && !p.ticket) {
            // Revisar por cada categoria si fue recogido
            const categoriasPedido = Array.from(new Set((p.detalles || []).map((d: any) => d.platillo.categoria)));
            for (const cat of categoriasPedido) {
              const clave = `${p.idPedido}_${cat}`;
              if (!idsRecogidos.includes(clave)) {
                const copia = { ...p, categoria: cat };
                if (!this.pedidosListos.find(pl => pl.idPedido === copia.idPedido && pl.categoria === copia.categoria)) {
                  this.pedidosListos.push(copia);
                }
              }
            }
          }
        });
        this.guardarPedidosListosEnCache();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando mesas:', err)
    });
  }

  escucharSockets() {
    if (this.socketSub) this.socketSub.unsubscribe();

    this.socketSub = this.socketService.listen('pedido_listo_notificacion').subscribe((data: any) => {
      // 1. FILTRO ANTI-DUPLICADOS (Anti-rebote de 2s)
      const notifId = `${data.pedidoId}-${data.categoria}`;
      const ahora = Date.now();

      if (this.ultimasNotificaciones.has(notifId)) {
        const ultimaVez = this.ultimasNotificaciones.get(notifId) || 0;
        if (ahora - ultimaVez < 2000) return; // Ignorar si es muy reciente
      }
      this.ultimasNotificaciones.set(notifId, ahora);

      console.log('🔔 NOTIFICACIÓN SOCKET:', data);

      // 2. ENRIQUECER DATOS 
      let pedidoCompleto = null;
      const numMesa = Number(data.mesa);

      if (!isNaN(numMesa) && this.mesas.length > 0) {
        const mesaDelPedido = this.mesas.find(m => m.numero === numMesa);
        if (mesaDelPedido?.pedidoActivo?.idPedido === data.pedidoId) {
          pedidoCompleto = mesaDelPedido?.pedidoActivo;
        }
      }

      // 3. TEXTOS AMIGABLES
      let textoCategoria = 'Pedido';
      if (data.categoria === 'BEBIDA') textoCategoria = '🍺 Bebidas';
      else if (data.categoria === 'PLATO_FUERTE') textoCategoria = '🥘 Platos Fuertes';
      else if (data.categoria === 'ENTRADA') textoCategoria = '🥗 Entradas';
      else if (data.categoria === 'POSTRE') textoCategoria = '🍰 Postres';

      // 4. CREAR OBJETO VISUAL (Blindado contra nulos)
      const alertaVisual = {
        ...data,
        idUnico: notifId,
        idPedido: data.pedidoId,
        titulo: `Mesa ${data.mesa}`,
        mensaje: `${textoCategoria} listas`,
        hora: new Date(),
        detalles: pedidoCompleto?.detalles || data.detalles || [],
        total: pedidoCompleto?.total || data.total || 0,
        pedido: pedidoCompleto || null,
        categoria: data.categoria
      };

      // Agregar solo si no existe
      const existe = this.pedidosListos.find((p: any) =>
        (p.idPedido === alertaVisual.idPedido) && (p.categoria === alertaVisual.categoria)
      );

      if (!existe) {
        this.pedidosListos.unshift(alertaVisual);
        this.guardarPedidosListosEnCache();
      }

      // 5. MOSTRAR TOAST
      this.notificacionReciente = alertaVisual;
      this.reproducirSonido();
      this.cdr.detectChanges();

      setTimeout(() => {
        if (this.notificacionReciente === alertaVisual) {
          this.notificacionReciente = null;
          this.cdr.detectChanges();
        }
      }, 7000);
    });
  }

  // --- ACCIONES ---

  gestionarMesa(mesa: MesaView) {
    if (!mesa.pedidoActivo) {
      this.irATomarPedido(mesa.numero);
    } else {
      this.mesaSeleccionada = mesa;
    }
  }

  irATomarPedido(numMesa: number) {
    this.router.navigate(['/mesero/toma-pedido', numMesa]);
  }

  marcarEntregado(itemAlerta: any) {

    // Normalizar ID (puede venir del socket o de BD)
    const idParaBorrar = itemAlerta.idUnico || itemAlerta.idPedido || itemAlerta.pedidoId;
    const idRealPedido = itemAlerta.idPedido || itemAlerta.pedidoId;

    this.pedidosService.actualizarEstadoPedido(idRealPedido, StatusPedido.ENTREGADO)
      .subscribe({
        next: () => console.log(`Pedido ${idRealPedido} marcado como ENTREGADO`),
        error: (err) => console.error('Error al actualizar estado:', err)
      });

    // 1. Quitar visualmente
    if (itemAlerta.idUnico) {
      this.pedidosListos = this.pedidosListos.filter(i => i.idUnico !== idParaBorrar);
    } else {
      this.pedidosListos = this.pedidosListos.filter(i => (i.idPedido || i.pedidoId) !== idRealPedido);
    }
    this.guardarPedidosListosEnCache();

    this.notificacionReciente = null;

    // 2. Guardar en memoria local y avisar cocina
    if (idRealPedido) {
      const categoria = itemAlerta.categoria || itemAlerta.categoriaVisual || 'DESCONOCIDA';
      this.guardarIdRecogido(idRealPedido, categoria);
      this.socketService.emit('pedido_entregado_mesero', { pedidoId: idRealPedido, categoria });
    }
  }

  cerrarCuenta(mesa: MesaView) {
    if (!mesa.pedidoActivo) return;

    if (confirm(`¿Cerrar cuenta de Mesa ${mesa.numero} por $${mesa.total}?`)) {
      this.ticketsService.generarTicket(mesa.pedidoActivo.idPedido, 'EFECTIVO').subscribe({
        next: () => {
          alert('Ticket enviado a Caja 🖨️');
          mesa.pedidoActivo = null;
          mesa.total = 0;
          this.mesaSeleccionada = null;
          this.cargarEstadoMesas();
        },
        error: (err) => console.error(err)
      });
    }
  }

  reproducirSonido() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.play().catch(() => { });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch (e) { }
  }

  // --- HELPERS PARA VISTA POR MESA ---
  getPedidosListosPorMesa(numMesa: number): any[] {
    return this.pedidosListos.filter(p => Number(p.mesa) === numMesa || Number(p.numMesa) === numMesa);
  }

  tienePedidosListos(numMesa: number): boolean {
    return this.getPedidosListosPorMesa(numMesa).length > 0;
  }

  // --- LOCALSTORAGE ---
  private platformId = inject(PLATFORM_ID);

  private guardarPedidosListosEnCache() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pedidosListos_cache', JSON.stringify(this.pedidosListos));
    }
  }

  private cargarPedidosListosDeCache() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const data = localStorage.getItem('pedidosListos_cache');
      if (data) {
        this.pedidosListos = JSON.parse(data);
      }
    } catch (e) {
      console.error('Error parseando pedidos listos', e);
      this.pedidosListos = [];
    }
  }

  private obtenerIdsRecogidos(): string[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const data = localStorage.getItem('pedidos_recogidos_ids');
    return data ? JSON.parse(data) : [];
  }

  private guardarIdRecogido(id: number, categoria: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const ids = this.obtenerIdsRecogidos();
    const clave = `${id}_${categoria}`;
    if (!ids.includes(clave)) {
      ids.push(clave);
      localStorage.setItem('pedidos_recogidos_ids', JSON.stringify(ids));
    }
  }
}
