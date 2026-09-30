import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { StatusPedido } from './dto/update-status.dto';

describe('PedidosService', () => {
  let service: PedidosService;
  let prisma: any;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
    },
    pedido: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    detallePedido: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    platillo: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
  });

  describe('create', () => {
    it('should throw if user does not exist', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      const fakeUser = { sub: 1 };
      await expect(
        service.create({ numMesa: 5, items: [] }, fakeUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user does not exist', async () => {
      await expect(
        service.create({ numMesa: 5, items: [] }, null), // pasar null o undefined para simular user inexistente
      ).rejects.toThrow(NotFoundException);
    });
    
    it('should create pedido and return full response', async () => {
      const fakeUser = { sub: 1 }; // Usuario existente en la BD
      const dto = {

        numMesa: 5,
        items: [{ idPlatillo: 10, cantidad: 2 }],
      };

      const pedido = { idPedido: 1 };
      const pedidoCompleto = { idPedido: 1, detalles: [] };

      prisma.usuario.findUnique.mockResolvedValue({ idUsuario: 1 });
      prisma.pedido.create.mockResolvedValue(pedido);
      prisma.detallePedido.create.mockResolvedValue({});
      prisma.pedido.findUnique.mockResolvedValue(pedidoCompleto);

      const result = await service.create(dto, fakeUser);

      expect(result).toEqual({
        message: 'Pedido creado correctamente',
        pedido: pedidoCompleto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all pedidos', async () => {
      const pedidos = [{ idPedido: 1 }];
      prisma.pedido.findMany.mockResolvedValue(pedidos);

      const result = await service.findAll();
      expect(result).toEqual(pedidos);
    });
  });

  describe('findOne', () => {
    it('should return a pedido with details', async () => {
      const pedido = { idPedido: 1, detalles: [] };
      prisma.pedido.findUnique.mockResolvedValue(pedido);

      const result = await service.findOne(1);
      expect(result).toEqual(pedido);
    });
  });

  describe('update', () => {
    it('should throw if pedido not found', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { items: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update pedido with new items', async () => {
      const dto = {
        items: [{ idPlatillo: 1, cantidad: 2 }],
      };

      prisma.pedido.findUnique.mockResolvedValue({ idPedido: 1 });
      prisma.platillo.findUnique.mockResolvedValue({ idPlatillo: 1 });
      prisma.detallePedido.create.mockResolvedValue({});
      prisma.pedido.findUnique.mockResolvedValue({ idPedido: 1, detalles: [] });

      const result = await service.update(1, dto);

      expect(result).toEqual({
        message: 'Pedido actualizado correctamente',
        pedido: { idPedido: 1, detalles: [] },
      });
    });
  });

  describe('removePlatillosDelPedido', () => {
    it('should throw if pedido not found', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(
        service.removePlatillosDelPedido(1, { idPlatillos: [1, 2] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove platillos and return updated pedido', async () => {
      prisma.pedido.findUnique
        .mockResolvedValueOnce({ idPedido: 1 }) // pedido existente
        .mockResolvedValueOnce({ idPedido: 1, detalles: [] }); // pedido actualizado
      prisma.detallePedido.deleteMany.mockResolvedValue({});

      const result = await service.removePlatillosDelPedido(1, {
        idPlatillos: [1, 2],
      });

      expect(result).toEqual({
        message: 'Platillos eliminados del pedido correctamente',
        pedido: { idPedido: 1, detalles: [] },
      });
    });
  });

  describe('actualizarEstado', () => {
    it('should throw if pedido not found', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarEstado(1, { estado: StatusPedido.ENTREGADO }),
      ).rejects.toThrow(new NotFoundException('Pedido 1 no encontrado'));
    });

    it('should update estado and return pedido', async () => {
      const pedidoActualizado = { idPedido: 1, status: StatusPedido.ENTREGADO };

      prisma.pedido.findUnique.mockResolvedValue({ idPedido: 1 });
      prisma.pedido.update.mockResolvedValue(pedidoActualizado);

      const result = await service.actualizarEstado(1, {
        estado: StatusPedido.ENTREGADO,
      });

      expect(result).toEqual({
        message: 'Estado del pedido actualizado a ENTREGADO',
        pedido: pedidoActualizado,
      });
    });
  });

  describe('remove', () => {
    it('should throw if pedido not found', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete pedido', async () => {
      prisma.pedido.findUnique.mockResolvedValue({ idPedido: 1 });
      prisma.pedido.delete.mockResolvedValue({ idPedido: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ idPedido: 1 });
    });
  });
});
