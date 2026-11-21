import { IsInt, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTicketDto {

  @ApiProperty({ description: 'ID del usuario que crea el ticket' })
  @IsInt()
  idPedido: number;

  @ApiProperty({ description: 'ID del usuario que crea el ticket' })
  @IsString()
  metodoPago: string;

}
