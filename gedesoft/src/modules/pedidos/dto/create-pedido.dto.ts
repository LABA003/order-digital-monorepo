import {
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItem {
  @ApiProperty({ description: 'ID del platillo', example: 1 })
  @IsInt()
  idPlatillo: number;

  @ApiProperty({ description: 'cantidad del pedido' , example: 3})
  @IsInt()
  cantidad: number;
}

export class CreatePedidoDto {
  //@IsInt()
  //idUsuario?: number;
  @ApiProperty({ description: 'Número de mesa', example: 5 })
  @IsInt()
  numMesa: number;

  //@IsDateString()
  //fecha?: string;

 // @IsEnum(StatusPedido)
  //status?: StatusPedido;
  @ApiProperty({ description: 'Lista de platillos del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[];
}
