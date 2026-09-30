import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto
} from '../core/interfaces/usuarios.interfaces';
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/usuarios'; // API de Nest.js


  /**
   * (Admin) Obtiene todos los usuarios
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /**
   *  Obtiene un usuario por ID
   * Corresponde a: @Get(':id')
   */
  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * (Admin) Crea un nuevo usuario
   */
  crearUsuario(data: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/create`, data);
  }
  
  /**
   * (Admin) Actualiza un usuario
   */
  actualizarUsuario(id: number, data: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * (Admin) Elimina un usuario
   */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  guardarUsuario() {
    throw new Error('Method not implemented.');
  }
}
