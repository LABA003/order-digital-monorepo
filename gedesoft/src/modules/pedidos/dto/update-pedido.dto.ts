import {
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlatilloItemDto {
  @ApiProperty({ description: 'ID del platillo', example: 1 })
  @IsInt()
  idPlatillo: number;

  @ApiProperty({ description: 'Cantidad del platillo', example: 2 })
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class UpdatePedidoDto {
  @ApiProperty({ description: 'ID del pedido a actualizar', example: 1 })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePlatilloItemDto)
  items?: UpdatePlatilloItemDto[];
}
