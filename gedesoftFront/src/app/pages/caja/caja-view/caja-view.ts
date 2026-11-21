import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { WebSocketService } from '../../../services/web-socket';
import { TicketsService } from '../../../services/tickets';

@Component({
  selector: 'app-caja-view',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './caja-view.html',
  styleUrl: './caja-view.scss',
})
export class CajaView implements OnInit, OnDestroy {
  private webSocketService = inject(WebSocketService);
  private ticketsService = inject(TicketsService);

  // Listas separadas para organizar la pantalla
  ticketsPendientes: any[] = [];
  ticketsImpresos: any[] = [];
  
  ticketParaImprimir: any = null; // Variable temporal para el diseño de impresión
  
  // Control para mostrar/ocultar el historial (por defecto visible si así lo prefieres)
  mostrarHistorial: boolean = false; 

  ngOnInit() {
    // 1. Cargar tickets y separarlos según memoria del navegador
    if (isPlatformBrowser(this.platformId)) {
      this.cargarTickets();
    }

    // 2. ESCUCHAR LA SEÑAL DEL BACKEND (Tiempo Real)
    this.webSocketService.listen('nuevo_ticket').subscribe((ticket: any) => {
      console.log('¡Nuevo ticket recibido!', ticket);
      
      // Como acaba de llegar, seguro es pendiente
      this.ticketsPendientes.unshift(ticket);

      // Opcional: Alerta sonora
      // const audio = new Audio('assets/sounds/ding.mp3'); 
      // audio.play().catch(() => {});
    });
  }

  cargarTickets() {
    this.ticketsService.obtenerTodos().subscribe(data => {
      // Obtenemos la lista de IDs que ya hemos impreso antes
      const idsImpresos = this.obtenerIdsImpresosStorage();
      console.log('IDs recuperados del historial:', idsImpresos);

      this.ticketsPendientes = [];
      this.ticketsImpresos = [];

      data.forEach((t: any) => {
        // CLASIFICACIÓN ROBUSTA: Convertimos todo a número para evitar errores de texto vs número
        const idActual = Number(t.idTicket);
        
        if (idsImpresos.includes(idActual)) {
          this.ticketsImpresos.push(t);
        } else {
          this.ticketsPendientes.push(t);
        }
      });

      // Ordenar: Los más recientes primero en ambas listas
      this.ticketsImpresos.sort((a, b) => b.idTicket - a.idTicket);
      this.ticketsPendientes.sort((a, b) => b.idTicket - a.idTicket);
    });
  }

  prepararImpresion(ticket: any) {
    console.log('Imprimiendo ticket ID:', ticket.idTicket);
    
    // 1. Obtener datos completos para la impresión física
    this.ticketsService.obtenerTicketPorId(ticket.idTicket).subscribe({
      next: (ticketCompleto) => {
        this.ticketParaImprimir = ticketCompleto;

        // Damos tiempo a Angular para renderizar el ticket oculto antes de abrir diálogo
        setTimeout(() => {
          window.print();
        }, 500);
      },
      error: (error) => {
        console.error('Error al obtener datos completos:', error);
        alert('Error al obtener datos para impresión.');
      }
    });

    // 2. LOGICA VISUAL: Mover de "Pendientes" a "Impresos" instantáneamente
    this.ticketsPendientes = this.ticketsPendientes.filter(t => t.idTicket !== ticket.idTicket);
    
    // Lo agregamos a impresos (evitando duplicados visuales)
    if (!this.ticketsImpresos.find(t => t.idTicket === ticket.idTicket)) {
       this.ticketsImpresos.unshift(ticket);
    }

    // 3. PERSISTENCIA: Guardar en el navegador que este ticket ya se imprimió
    this.guardarIdImpreso(ticket.idTicket);
  }

  // --- MÉTODOS PRIVADOS (LOCALSTORAGE) ---
  private platformId = inject(PLATFORM_ID);

  private obtenerIdsImpresosStorage(): number[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const data = localStorage.getItem('tickets_impresos_ids');
    if (!data) return [];
    try {
      // Parseamos y aseguramos que cada ID sea un número real
      return JSON.parse(data).map((id: any) => Number(id));
    } catch (e) {
      console.error('Error al leer localStorage', e);
      return [];
    }
  }

  private guardarIdImpreso(id: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const idNumero = Number(id);
    const ids = this.obtenerIdsImpresosStorage();
    
    // Solo guardamos si no existe ya para no llenar la memoria de repetidos
    if (!ids.includes(idNumero)) {
      ids.push(idNumero);
      localStorage.setItem('tickets_impresos_ids', JSON.stringify(ids));
    }
  }

  // Botón para desplegar historial
  toggleHistorial() {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  ngOnDestroy() {
    // Desuscribirse si es necesario
  }
}