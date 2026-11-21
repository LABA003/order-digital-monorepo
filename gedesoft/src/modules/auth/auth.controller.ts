import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra un nuevo usuario.
   * @param dto Datos del usuario a registrar.
   * @returns Información del usuario registrado.
   */
  
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login a user'})
  @Post('login')
  login(@Body() dto: LoginDto) {
    console.log('Login attempt with:', dto);
    return this.authService.login(dto.email, dto.password);
  }
}
