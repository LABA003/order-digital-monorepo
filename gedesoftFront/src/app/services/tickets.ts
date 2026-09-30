import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/tickets'; // Ajusta a tu puerto

  // Esta función es la que llamará el Mesero

  obtenerTicketPorId(id: number): Observable<any> {
    //rura con todods los detalle
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  generarTicket(idPedido: number, metodoPago: string = 'EFECTIVO'): Observable<any> {
    return this.http.post(this.apiUrl, {
      idPedido,
      metodoPago
    });
  }

  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
