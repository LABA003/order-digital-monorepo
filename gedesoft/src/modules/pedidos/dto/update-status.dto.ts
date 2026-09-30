import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum StatusPedido {
  PENDIENTE = 'PENDIENTE',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export class UpdateStatusDto {
  @ApiProperty({description:'estado del pedido', example: 'PENDIENTE,  ENTREGADO, CANCELADO'})
  @IsEnum(StatusPedido, {
    message:
      'Estado inválido. Opciones válidas: PENDIENTE,  ENTREGADO, CANCELADO',
  })
  estado: StatusPedido;
}
