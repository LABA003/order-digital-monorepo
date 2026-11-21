import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreatePedidoDto,
  Pedido,
  PedidoResponse,
  RemovePlatillosDto,
  UpdatePedidoDto,
  StatusPedido,
  DetallePendiente
} from '../core/interfaces/pedidos.interfaces'; 

@Injectable({
  providedIn: 'root',
})
export class PedidosService { 
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/pedidos'; 

  
  /**
   * (Mesero) EnvÃ­a un nuevo pedido al backend
   */
  // Antes: crearPedido(pedido: { items: any[], total: number }): Observable<any>
  crearPedido(dto: CreatePedidoDto): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/create`, dto);
  }

  /**
   * (Cocinero) Obtiene los pedidos pendientes para una categorÃ­a
   */
  obtenerPendientesPorCategoria(categoria: string): Observable<DetallePendiente[]> {
    return this.http.get<DetallePendiente[]>(`${this.apiUrl}/pendientes/${categoria}`);
  }

  /**
   * (Cocinero) Actualiza el estado de un pedido (ej: 'en_preparacion', 'listo')
   */
  actualizarEstadoPedido(idPedido: number, dto: StatusPedido): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/${idPedido}/estado`, { estado: dto });
  }

  /**
   * Obtiene todos los pedidos.
   * Corresponde a: @Get()
   */
  obtenerTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  /**
   * Obtiene un pedido especÃ­fico por su ID.
   * Corresponde a: @Get(':id')
   */
  obtenerPedidoPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  /**
   * Agrega nuevos platillos a un pedido existente.
   * Corresponde a: @Patch(':idPedido')
   */
  agregarPlatillos(idPedido: number, dto: UpdatePedidoDto): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/${idPedido}`, dto);
  }

  /**
   * Elimina platillos especÃ­ficos de un pedido.
   * Corresponde a: @Patch(':idPedido/eliminar-platillos')
   */
  eliminarPlatillos(idPedido: number, dto: RemovePlatillosDto): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/${idPedido}/eliminar-platillos`, dto);
  }

  /**
   * (Admin) Elimina un pedido completo.
   * Corresponde a: @Delete(':id')
   */
  eliminarPedido(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
