import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  nombreUsuario: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'example@gmail.com'})
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Imagen del usuario', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: '1234567890' })
  @IsString()
  @MinLength(10)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Role, required: true })
  @IsEnum(Role)
  rol?: Role;
}
