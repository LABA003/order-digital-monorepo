import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../generated/prisma';

describe('UsuariosController (e2e)', () => {
  let app: INestApplication;
  let createdUsuario: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/usuarios/create (POST) → crea un usuario', async () => {
    const dto = {
      nombreUsuario: 'UsuarioPrueba',
      email: `test${Date.now()}@mail.com`, // email único para evitar conflicto
      password: '12345678',
      rol: Role.MESERO,
    };

    const { body } = await request(app.getHttpServer())
      .post('/usuarios/create')
      .send(dto)
      .expect(201);

    expect(body).toHaveProperty('idUsuario');
    expect(body.nombreUsuario).toBe(dto.nombreUsuario);
    expect(body.email).toBe(dto.email);
    expect(body.rol).toBe(dto.rol);

    createdUsuario = body;
  });

  it('/usuarios (GET) → obtiene todos los usuarios', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/usuarios')
      .expect(200);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('/usuarios/:id (GET) → obtiene un usuario por id', async () => {
    const { body } = await request(app.getHttpServer())
      .get(`/usuarios/${createdUsuario.idUsuario}`)
      .expect(200);

    expect(body).toHaveProperty('idUsuario', createdUsuario.idUsuario);
    expect(body.nombreUsuario).toBe(createdUsuario.nombreUsuario);
    expect(body.email).toBe(createdUsuario.email);
  });

  it('/usuarios/:id (PUT) → actualiza un usuario', async () => {
    const updateDto = {
      nombreUsuario: 'UsuarioActualizado',
      rol: Role.ADMIN,
    };

    const { body } = await request(app.getHttpServer())
      .put(`/usuarios/${createdUsuario.idUsuario}`)
      .send(updateDto)
      .expect(200);

    expect(body).toHaveProperty('idUsuario', createdUsuario.idUsuario);
    expect(body.nombreUsuario).toBe(updateDto.nombreUsuario);
    expect(body.rol).toBe(updateDto.rol);
  });


  afterAll(async () => {
    await app.close();
  });
});
