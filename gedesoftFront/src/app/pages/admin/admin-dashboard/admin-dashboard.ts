import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatillosService } from '../../../services/platillos';
import { UsuariosService } from '../../../services/usuarios';

import {
  Platillo,
  CreatePlatilloDto,
  UpdatePlatilloDto
} from '../../../core/interfaces/platillos.interfaces';
import { CreateUsuarioDto, UpdateUsuarioDto, Usuario } from '../../../core/interfaces/usuarios.interfaces';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    CommonModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  // Servicios
  private platillosService = inject(PlatillosService);
  private usuariosService = inject(UsuariosService);

  // Estado
  vistaActual: 'platillos' | 'usuarios' = 'platillos';
  platillos: Platillo[] = [];
  usuarios: Usuario[] = [];

  // Modal y Formularios
  mostrarModalPlatillo = false;
  mostrarModalUsuario = false;
  esModoEdicion = false;

  platilloActual: CreatePlatilloDto | Platillo = this.getPlatilloDefault();
  usuarioActual: CreateUsuarioDto | Usuario = this.getUsuarioDefault();

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarPlatillos();
      this.cargarUsuarios();
    }
  }

  // --- Funciones 'Default' para resetear formularios ---
  getPlatilloDefault(): CreatePlatilloDto {
    return {
      nombrePlatillo: '',
      precio: 0,
      categoria: 'OTRO',
      descripcion: '',
      imagen: '',
      status: true
    };
  }

  getUsuarioDefault(): CreateUsuarioDto {
    return {
      nombreUsuario: '',
      imagen: '',
      email: '',
      password: '',
      rol: 'MESERO'
    };
  }

  // --- Carga de Datos ---
  cargarPlatillos() {
    this.platillosService.obtenerPlatillos().subscribe((data: Platillo[]) => this.platillos = data);
  }

  cargarUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe((data: Usuario[]) => this.usuarios = data);
  }

  // --- Lógica de Modales ---
  abrirModalPlatillo(platillo: Platillo | null = null) {
    if (platillo) {
      this.esModoEdicion = true;
      this.platilloActual = { ...platillo }; // Copia el platillo existente
    } else {
      this.esModoEdicion = false;
      this.platilloActual = this.getPlatilloDefault(); // Usa el objeto default
    }
    this.mostrarModalPlatillo = true;
  }

  abrirModalUsuario(usuario: Usuario | null = null) {
    if (usuario) {
      this.esModoEdicion = true;
      this.usuarioActual = { ...usuario, password: '' }; // Copia y omite pass
    } else {
      this.esModoEdicion = false;
      this.usuarioActual = this.getUsuarioDefault(); // Usa el objeto default
    }
    this.mostrarModalUsuario = true;
  }

  cerrarModales() {
    this.mostrarModalPlatillo = false;
    this.mostrarModalUsuario = false;
  }

  // --- Lógica de Guardado ---
  guardarUsuario() {
    if (this.esModoEdicion) {
      // --- ACTUALIZAR ---
      // 1. Convertimos a objeto plano para poder manipularlo
      const usuarioAEditar = { ...this.usuarioActual } as Usuario;
      const idUsuario = usuarioAEditar.idUsuario;

      // 2. Preparamos el DTO
      // Eliminamos el ID porque no se envía en el body usualmente
      const { idUsuario: _, ...dataToSend } = usuarioAEditar;

      // 3. Lógica vital de Contraseña:
      // Si el password está vacío, LO QUITAMOS del objeto para que no se sobrescriba en la BD
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete (dataToSend as any).password;
      }

      this.usuariosService.actualizarUsuario(idUsuario, dataToSend as UpdateUsuarioDto).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModales();
          alert('Usuario actualizado correctamente');
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar: ' + (err.error?.message || 'Error desconocido'));
        }
      });

    } else {
      // --- CREAR ---
      // Validar que haya password al crear
      const nuevoUsuario = this.usuarioActual as CreateUsuarioDto;
      if (!nuevoUsuario.password) {
        alert("La contraseña es obligatoria para nuevos usuarios");
        return;
      }

      this.usuariosService.crearUsuario(nuevoUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModales();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear usuario: ' + (err.error?.message || 'Revise los datos'));
        }
      });
    }
  }

  guardarPlatillo() {
    if (this.esModoEdicion) {
      const { idPlatillo, ...dto } = this.platilloActual as Platillo;

      this.platillosService.actualizarPlatillo(idPlatillo, dto as UpdatePlatilloDto).subscribe({
        next: () => {
          this.cargarPlatillos();
          this.cerrarModales();
        },
        error: (err) => alert('Error al actualizar platillo')
      });
    } else {
      this.platillosService.crearPlatillo(this.platilloActual as CreatePlatilloDto).subscribe({
        next: () => {
          this.cargarPlatillos();
          this.cerrarModales();
        },
        error: (err) => alert('Error al crear platillo')
      });
    }
  }

  // --- Lógica de Eliminación ---
  eliminarPlatillo(idPlatillo: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este platillo?')) {
      this.platillosService.eliminarPlatillo(idPlatillo).subscribe(() => {
        this.cargarPlatillos();
      });
    }
  }

  eliminarUsuario(idUsuario: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(idUsuario).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }
}