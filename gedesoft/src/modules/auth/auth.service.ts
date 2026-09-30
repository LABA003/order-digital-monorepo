import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
// Asegúrate de que Role esté importado correctamente
import { Role, Usuario } from '../../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async register(dto: AuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userRole =  dto.rol ?? Role.MESERO;
    
    const user = await this.prisma.usuario.create({
      data: {
        nombreUsuario: dto.nombreUsuario,
        email: dto.email,
        imagen: dto.imagen,
        password: hashedPassword,
        rol: userRole,
      },
    });

    // 1. Generar el token
    const tokenString = await this.signToken(user.idUsuario, user.email, user.rol);

    // 2. Retornar la ESTRUCTURA COMPLETA que el frontend espera
    return {
      accessToken: tokenString,
      user: {
        role: user.rol // Mapea 'rol' de tu DB al 'role' que espera el frontend
      }
    };
  }

  async login(email: string, password: string) {
    // 1. Buscar usuario
    const user = await this.prisma.usuario.findUnique({ where: { email } });

    // 2. Validar credenciales
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar el token
    const tokenString = await this.signToken(user.idUsuario, user.email, user.rol);

    // 4. Retornar la ESTRUCTURA COMPLETA que el frontend espera
    return {
      accessToken: tokenString, // 'accessToken' (camelCase) como espera el front
      user: {
        role: user.rol // 'role' (en inglés) como espera el front
      }
    };
  }

  /**
   * Genera un string de token JWT.
   * Modificado para ser async y retornar solo el string.
   */
  private async signToken(userId: number, email: string, role: Role): Promise<string> {
    // Es buena práctica incluir el rol en el payload del JWT
    const payload = {
      sub: userId,
      email,
      role: role // Añadido rol al token
    };

    // Usar signAsync para ser consistentes con async/await
    return this.jwt.signAsync(payload);
  }
}