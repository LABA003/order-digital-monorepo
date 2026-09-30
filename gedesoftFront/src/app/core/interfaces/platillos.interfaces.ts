
export interface Platillo {
  idPlatillo: number;
  nombrePlatillo: string; 
  descripcion?: string;   
  imagen?: string;        
  precio: number;
  categoria: string;      
  status?: boolean;
}

/**
 * DTO para CREAR un nuevo platillo.
 */
export interface CreatePlatilloDto {
  nombrePlatillo: string;
  precio: number;
  categoria: string; // Ej: 'BEBIDA', 'PLATO_FUERTE'
  descripcion?: string;
  imagen?: string;
  status?: boolean;
}

/**
 * DTO para ACTUALIZAR un platillo.
 */
export interface UpdatePlatilloDto {
  nombrePlatillo?: string;
  precio?: number;
  categoria?: string;
  descripcion?: string;
  imagen?: string;
  status?: boolean;
}