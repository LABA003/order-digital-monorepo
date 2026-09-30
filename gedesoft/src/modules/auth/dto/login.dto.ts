import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'example@gmail.com'})
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  password: string;


}
