import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Platillo,
  CreatePlatilloDto,
  UpdatePlatilloDto
} from '../core/interfaces/platillos.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PlatillosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/platillos'; // API de Nest.js


  // Admin: Crear platillo
  crearPlatillo(data: CreatePlatilloDto): Observable<Platillo> {
    return this.http.post<Platillo>(`${this.apiUrl}/create`, data);
  }

  // Mesero/Admin: Obtener todos
  obtenerPlatillos(): Observable<Platillo[]> {
    return this.http.get<Platillo[]>(this.apiUrl);
  }

  /**
   * (NUEVO) Obtener un platillo por su ID
   * Corresponde a: @Get(':id')
   */
  obtenerPlatilloPorId(id: number): Observable<Platillo> {
    return this.http.get<Platillo>(`${this.apiUrl}/${id}`);
  }



  actualizarPlatillo(id: number, data: UpdatePlatilloDto): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.apiUrl}/${id}`, data);
  }

  /**
   *  Eliminar un platillo por su ID
   * Corresponde a: @Delete(':id')
   */
  eliminarPlatillo(id: number): Observable<any> {
    // Un DELETE exitoso usualmente no devuelve contenido (void) o un { success: true }
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  
}

