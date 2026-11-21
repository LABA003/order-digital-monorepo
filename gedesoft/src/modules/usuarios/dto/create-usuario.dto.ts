import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {

  @ApiProperty({description: 'Nombre del usuario',})
  @IsString()
  nombreUsuario: string;

  @ApiProperty({description: 'Email del usuario',})
  @IsEmail()
  email: string;

  @ApiProperty({description: 'Imagen del usuario', required: false})
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({description: 'Contraseña del usuario',})
  @IsString()
  password: string;

  @ApiProperty({description: 'Rol del usuario', enum: Role})
  @IsEnum(Role)
  rol: Role;
}
