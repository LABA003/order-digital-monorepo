import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Pedidos con verificación de usuario (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let platillos: any[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('¡Hola, esta es la API!');
  });

  it('/POST auth/login → obtiene token', async () => {
    const dto = {
      email: 'test@gmail.com',
      password: '12345678910',
    };

    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(201);

    console.log('Login response:', body);

    expect(body.access_token).toBeDefined();

    token = body.access_token;
  });

  it('/GET platillos → obtiene primeros 2', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/platillos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(2);

    platillos = body.slice(0, 2); // tomamos los primeros 2
  });

  it('/POST pedidos/create → crea pedido con 2 platillos', async () => {
    const dto = {
      numMesa: 1,
      items: platillos.map((p) => ({
        idPlatillo: p.idPlatillo,
        cantidad: 1,
      })),
    };

    const res = await request(app.getHttpServer())
      .post('/pedidos/create')
      .set('Authorization', `Bearer ${token}`)
      .send(dto)
      .expect(201);

    expect(res.body.message).toBe('Pedido creado correctamente');
    expect(res.body.pedido).toBeDefined();
    expect(res.body.pedido.idPedido).toBeDefined();
    expect(res.body.pedido.detalles.length).toBe(2);
  });

  afterAll(async () => {
    await app.close();
  });
});
