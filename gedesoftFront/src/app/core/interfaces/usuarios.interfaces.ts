
export enum Role {
  ADMIN = 'ADMIN',
  MESERO = 'MESERO',
  COCINERO = 'COCINERO',
  CAJERO = 'CAJERO',
}

/**
 * La interfaz base de 'Usuario'.
 * Esto es lo que el backend DEVUELVE.
 * Nota que NO incluye el password.
 */
export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  email: string;
  imagen?: string | null;
  password?: string; // Opcional, solo si se necesita
  rol: Role | string; // (Usar 'Role' es más estricto, 'string' es más flexible)
}

/**
 * DTO para CREAR un nuevo usuario.
 * Esto es lo que el frontend ENVÍA.
 * Debe incluir el password.
 */
export interface CreateUsuarioDto {
  nombreUsuario: string;
  email: string;
  password: string;
  rol: Role | string;
  imagen?: string | null;
}

/**
 * DTO para ACTUALIZAR un usuario.
 * Esto es lo que el frontend ENVÍA.
 * Todos los campos son opcionales.
 */
export interface UpdateUsuarioDto {
  nombreUsuario?: string;
  email?: string;
  password?: string; // Solo se envía si se quiere cambiar
  rol?: Role | string;
  imagen?: string | null;
}