import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma';


@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private readonly jwt: JwtService,

  ) { }

  /*create(data: CreateUsuarioDto) {
    return this.prisma.usuario.create({ data });
  }*/

  async create(data: CreateUsuarioDto) {
    // 1. Asegura que tenga password
    const plainPw = data.password ?? '';
    // 2. Evita re-hashear si ya viene como bcrypt (por si acaso)
    const needsHash = !String(plainPw).startsWith('$2'); // reconoce $2a|$2b|$2y
    const hashedPassword = needsHash ? await bcrypt.hash(plainPw, 10) : plainPw;

    // 3. Rol por defecto si no viene
    const userRole = data.rol ?? Role.MESERO;

    // 4. Crea el usuario guardando el hash
    const user = await this.prisma.usuario.create({
      data: {
        nombreUsuario: data.nombreUsuario,
        email: data.email,
        imagen: data.imagen,
        password: hashedPassword,
        rol: userRole,
      },
    });

    // 5. Generar token (usa tu método existente signToken)
    //const tokenString = await this.signToken(user.idUsuario, user.email, user.rol);

    // 6. Retornar la misma estructura que register (frontend espera accessToken y user.role)
    return {
     // accessToken: tokenString,
      user: {
        idUsuario: user.idUsuario,
        nombreUsuario: user.nombreUsuario,
        email: user.email,
        imagen: user.imagen,
        rol: user.rol,
      },
    };
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { idUsuario: id } });
  }

  async update(id: number, data: UpdateUsuarioDto) {
    await this.findOneOrFail(id);
    return this.prisma.usuario.update({ where: { idUsuario: id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.usuario.delete({ where: { idUsuario: id } });
  }

  private async findOneOrFail(id: number) {
    const usuario = await this.findOne(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
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
    return this.jwt.signAsync(payload,{
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
    
  }
}
