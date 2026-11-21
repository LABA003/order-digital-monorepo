
/**
 * DTO para crear un nuevo pedido.
 */
export interface CreatePedidoDto {
  numMesa: number;
  items: PedidoItemDto[];
}

/**
 * DTO para agregar items a un pedido existente.
 */
export interface UpdatePedidoDto {
  items: PedidoItemDto[];
}

/**
 * DTO para eliminar platillos de un pedido.
 */
export interface RemovePlatillosDto {
  idPlatillos: number[];
}

/**
 * Define los estados posibles de un pedido.
 * Un enum existe como TIPO y como VALOR (Objeto).
 */
export enum StatusPedido {
  PENDIENTE = 'PENDIENTE',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

/**
 * DTO para actualizar el estado de un pedido.
 */
export interface StatusPedidoUpdate {
  estado: StatusPedido; // Ej: 'PENDIENTE', 'LISTO'
}

/**
 * Sub-objeto para los items del pedido (usado en Create y Update).
 */
export interface PedidoItemDto {
  idPlatillo: number;
  cantidad: number;
}


// --- Interfaces para las Respuestas (Lo que el Backend devuelve) ---

/**
 * Estructura de la respuesta genérica del backend para Create/Update/Delete
 */
export interface PedidoResponse {
  message: string;
  pedido: Pedido;
}

/**
 * La estructura completa de un Pedido que devuelve el backend
 * (basado en los 'includes' de Prisma).
 */
export interface Pedido {
  idPedido: number;
  idUsuario: number;
  numMesa: number;
  status: string;
  createdAt: string; // O puedes usar 'Date'
  updatedAt: string; // O puedes usar 'Date'
  usuario?: any; // Define la interfaz de Usuario si la tienes
  detalles: DetallePedido[];
  ticket: any;
}

export interface DetallePedido {
  idDetallePedido: number;
  idPedido: number;
  idPlatillo: number;
  cantidad: number;
  platillo: Platillo;
}

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
 * Lo que devuelve el endpoint 'pendientes por categoría'.
 * Es un 'DetallePedido' con información extra del pedido.
 */
export interface DetallePendiente {
  idDetallePedido: number;
  idPlatillo: number;
  cantidad: number;
  platillo: Platillo; // El platillo a preparar
  pedido: {
    // Info del pedido al que pertenece
    idPedido: number;
    numMesa: number;
    status: string;
  };
}

export interface TipoCategoria{
    categoria: string;
}