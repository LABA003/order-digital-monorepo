import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TicketsController (e2e) con auth', () => {
  let app: INestApplication;
  let token: string;
  let pedido: any;
  let createdTicket: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // 🔹 Login para obtener token
    const loginDto = {
      email: 'test@gmail.com',
      password: '12345678910',
    };

    const { body: loginBody } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201);

    token = loginBody.access_token;

    // 🔹 Crear un pedido válido con token
    const pedidoDto = {
      numMesa: 10,
      items: [],
    };

    const { body: pedidoBody } = await request(app.getHttpServer())
      .post('/pedidos/create')
      .set('Authorization', `Bearer ${token}`)
      .send(pedidoDto)
      .expect(201);

    pedido = pedidoBody.pedido;
  });

  it('/tickets (POST) → crea un ticket', async () => {
    const dto = {
      idPedido: pedido.idPedido,
      metodoPago: 'Tarjeta',
    };

    const { body } = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(dto)
      .expect(201);

    expect(body).toHaveProperty('idTicket'); // CORREGIDO
    expect(body.idPedido).toBe(dto.idPedido);
    expect(body.metodoPago).toBe(dto.metodoPago);

    createdTicket = body;
  });

  it('/tickets (GET) → obtiene todos los tickets', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('/tickets/:id (GET) → obtiene un ticket por id', async () => {
    const { body } = await request(app.getHttpServer())
      .get(`/tickets/${createdTicket.idTicket}`) // CORREGIDO
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(body).toHaveProperty('idTicket', createdTicket.idTicket);
    expect(body.idPedido).toBe(createdTicket.idPedido);
    expect(body.metodoPago).toBe(createdTicket.metodoPago);
  });

  it('/tickets/:id (PUT) → actualiza un ticket', async () => {
    const updateDto = {
      idPedido: createdTicket.idPedido,
      metodoPago: 'Efectivo',
    };

    const { body } = await request(app.getHttpServer())
      .put(`/tickets/${createdTicket.idTicket}`) // CORREGIDO
      .set('Authorization', `Bearer ${token}`)
      .send(updateDto)
      .expect(200);

    expect(body).toHaveProperty('idTicket', createdTicket.idTicket);
    expect(body.metodoPago).toBe(updateDto.metodoPago);
  });

  afterAll(async () => {
    await app.close();
  });
});
