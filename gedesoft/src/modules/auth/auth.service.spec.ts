import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { Role } from '../../../generated/prisma';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should hash password and create user, then return token', async () => {
      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
        nombreUsuario: 'testuser',
        imagen: '',
        rol: Role.ADMIN,
      };

      const hashed = 'hashed-password';
      const createdUser = {
        idUsuario: 1,
        email: dto.email,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
      mockPrisma.usuario.create.mockResolvedValue(createdUser);
      mockJwt.sign.mockReturnValue('signed-jwt');

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockPrisma.usuario.create).toHaveBeenCalledWith({
        data: {
          nombreUsuario: dto.nombreUsuario,
          email: dto.email,
          imagen: dto.imagen,
          password: hashed,
          rol: dto.rol,
        },
      });
      expect(result).toEqual({ access_token: 'signed-jwt' });
    });
  });

  describe('login', () => {
    it('should validate user and return token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const userFromDb = {
        idUsuario: 1,
        email,
        password: 'hashed-password',
      };

      mockPrisma.usuario.findUnique.mockResolvedValue(userFromDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('jwt-token');

      const result = await service.login(email, password);

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, userFromDb.password);
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.login('wrong@example.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = { idUsuario: 1, email: 'test@example.com', password: 'hashed' };
      mockPrisma.usuario.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(user.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });
});
