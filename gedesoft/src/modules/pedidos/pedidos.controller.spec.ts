import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { RemovePlatillosDto } from './dto/remove-platillos.dto';

describe('PedidosController', () => {
  let controller: PedidosController;
  let service: PedidosService;

  const mockPedidosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    removePlatillosDelPedido: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        {
          provide: PedidosService,
          useValue: mockPedidosService,
        },
      ],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
    service = module.get<PedidosService>(PedidosService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and user', async () => {
      const dto: CreatePedidoDto = { numMesa: 5, items: [{ idPlatillo: 1, cantidad: 2 }]};
      const user = { idUsuario: 1 };
      const req = { user } as any;

      const result = { idPedido: 1 };
      mockPedidosService.create.mockResolvedValue(result);

      const response = await controller.create(dto, req);
      expect(service.create).toHaveBeenCalledWith(dto, user);
      expect(response).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return all pedidos', async () => {
      const result = [{ idPedido: 1 }, { idPedido: 2 }];
      mockPedidosService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(response).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return one pedido by id', async () => {
      const result = { idPedido: 1 };
      mockPedidosService.findOne.mockResolvedValue(result);

      const response = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(response).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update pedido by id', async () => {
      const dto: UpdatePedidoDto = { items: [{ idPlatillo: 1, cantidad: 2 }] };
      const result = { success: true };
      mockPedidosService.update.mockResolvedValue(result);

      const response = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(response).toEqual(result);
    });
  });

  describe('removePlatillos', () => {
    it('should remove platillos from pedido', async () => {
      const dto: RemovePlatillosDto = { idPlatillos: [1, 2] };
      const result = { success: true };
      mockPedidosService.removePlatillosDelPedido.mockResolvedValue(result);

      const response = await controller.removePlatillos(1, dto);
      expect(service.removePlatillosDelPedido).toHaveBeenCalledWith(1, dto);
      expect(response).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should delete pedido by id', async () => {
      const result = { deleted: true };
      mockPedidosService.remove.mockResolvedValue(result);

      const response = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(response).toEqual(result);
    });
  });
});
