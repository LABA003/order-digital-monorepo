import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/tickets'; // Ajusta a tu puerto

  // Esta funciÃ³n es la que llamarÃ¡ el Mesero

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

