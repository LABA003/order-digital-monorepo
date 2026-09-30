import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TipoCategoria } from '../../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatilloDto {
  @ApiProperty({description: 'Nombre del platillo', example: 'Tacos al pastor'})
  @IsString()
  nombrePlatillo: string;

  @ApiProperty({description: 'Descripción del platillo', example: 'Milanesa de cerdo con salsa de ají'})
  @IsString()
  descripcion?: string;

  @ApiProperty({description: 'Imagen del platillo', required: false})
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({description: 'Precio del platillo', example: 150})
  @IsNumber()
  precio: number;

  @ApiProperty({description: 'Categoría del platillo', example: 'ENTRDA, BEBIDA, PLATO FUERTE'})
  @IsEnum(TipoCategoria)
  categoria?: TipoCategoria;

  @ApiProperty({description: 'Estatus si esta disponible', example: '1 o 0'})
  @IsBoolean()
  status?: boolean;
}
