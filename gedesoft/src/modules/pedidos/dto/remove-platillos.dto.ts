import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class RemovePlatillosDto {
  @ApiProperty({description: 'IDs de los platillos a eliminar', example: [1, 2, 3]})
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  idPlatillos: number[];
}
