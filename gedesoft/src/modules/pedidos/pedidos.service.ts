import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { RemovePlatillosDto } from './dto/remove-platillos.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusPedido, TipoCategoria } from 'generated/prisma';
import { PedidosGateway } from './pedidos.gateway';

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pedidosGateway: PedidosGateway
  ) { }

  async create(dto: CreatePedidoDto, user: any) {
    if (!user?.sub) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Crear pedido
    const pedido = await this.prisma.pedido.create({
      data: {
        idUsuario: user.sub,
        numMesa: dto.numMesa,
      },
    });

    // Crear detalles
    for (const item of dto.items) {
      await this.prisma.detallePedido.create({
        data: {
          idPedido: pedido.idPedido,
          idPlatillo: item.idPlatillo,
          cantidad: item.cantidad,
        },
      });
    }
    if (!pedido) {
      throw new NotFoundException('Pedido no creado');
    }
    // Obtener detalles completos
    const pedidoCompleto = await this.prisma.pedido.findUnique({
      where: { idPedido: pedido.idPedido },
      include: {
        usuario: true,
        detalles: {
          include: {
            platillo: true,
          },
        },
      },
    });

    if (pedidoCompleto) {
      this.pedidosGateway.emitirNuevoPedido(pedidoCompleto);
    }

    return {
      message: 'Pedido creado correctamente',
      pedido: pedidoCompleto,
    };
  }

  findAll() {
    //return this.prisma.pedido.findMany();
    return this.prisma.pedido.findMany({
      include: {
        detalles: {
          include: {
            platillo: true, // Incluye la info del platillo
          },
        },
        usuario: true, 
        ticket: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { idPedido: id },
      include: {
        detalles: {
          include: {
            platillo: true,
          },
        },
      },
    });
  }
  //actualizar pedido
  async update(idPedido: number, dto: UpdatePedidoDto) {
    //  Validar que el pedido exista
    const pedido = await this.prisma.pedido.findUnique({
      where: { idPedido },
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    }

    // . Si se proporcionan nuevos platillos, validarlos y agregarlos
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        const platillo = await this.prisma.platillo.findUnique({
          where: { idPlatillo: item.idPlatillo },
        });

        if (!platillo) {
          throw new NotFoundException(
            `Platillo ${item.idPlatillo} no encontrado`,
          );
        }

        /*await this.prisma.detallePedido.create({
          data: {
            idPedido,
            idPlatillo: item.idPlatillo,
            cantidad: item.cantidad,
          },
        });*/
        //definir llave primaria compuesta que se buscara
        const compositeId = {
          idPedido: idPedido,
          idPlatillo: item.idPlatillo,
        }

        //buscar si ese platillo ya existe en ese pedido
        const detalleExistente = await this.prisma.detallePedido.findUnique({
          //prisma genera automaticamente el metodo findUnique para llaves compuestas
          where: { idPedido_idPlatillo: compositeId}
        });

        if (detalleExistente) {
          await this.prisma.detallePedido.update({
            where: { idPedido_idPlatillo: compositeId},
            data:{
              cantidad:{
                increment: item.cantidad,
              },
            },
          });
          
        }
        else {
          await this.prisma.detallePedido.create({
            data:{
              idPedido : idPedido,
              idPlatillo: item.idPlatillo,
              cantidad: item.cantidad,
            },
          });
        }

      }
    }

    //  Retornar el pedido actualizado completo
    const pedidoActualizado = await this.prisma.pedido.findUnique({
      where: { idPedido },
      include: {
        usuario: true,
        detalles: {
          include: {
            platillo: true,
          },
        },
      },
    });

    if (pedidoActualizado) {
      // Emitir el pedido actualizado para que las pantallas (como cocina) se actualicen en tiempo real
      this.pedidosGateway.emitirNuevoPedido(pedidoActualizado);
    }

    return {
      message: 'Pedido actualizado correctamente',
      pedido: pedidoActualizado,
    };
  }
  //eliminar platillos
  async removePlatillosDelPedido(idPedido: number, dto: RemovePlatillosDto) {
    //  Verifica que el pedido exista
    const pedido = await this.prisma.pedido.findUnique({
      where: { idPedido },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    }

    //  Elimina los detallesPedido que coincidan con el idPedido y los idPlatillos dados
    await this.prisma.detallePedido.deleteMany({
      where: {
        idPedido: idPedido,
        idPlatillo: {
          in: dto.idPlatillos,
        },
      },
    });

    //  Devuelve el pedido actualizado
    const pedidoActualizado = await this.prisma.pedido.findUnique({
      where: { idPedido },
      include: {
        usuario: true,
        detalles: {
          include: {
            platillo: true,
          },
        },
      },
    });

    return {
      message: 'Platillos eliminados del pedido correctamente',
      pedido: pedidoActualizado,
    };
  }
  //actualizar estado pedido

  async actualizarEstado(idPedido: number, dto: UpdateStatusDto) {
    // Verifica que el pedido exista
    const pedido = await this.prisma.pedido.findUnique({
      where: { idPedido },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    }

    // Actualiza el estado
    const pedidoActualizado = await this.prisma.pedido.update({
      where: { idPedido },
      data: {
        status: dto.estado,
      },
      include: {
        usuario: true,
        detalles: {
          include: {
            platillo: true,
          },
        },
      },
    });

    return {
      message: `Estado del pedido actualizado a ${dto.estado}`,
      pedido: pedidoActualizado,
    };
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.pedido.delete({ where: { idPedido: id } });
  }

  private async findOneOrFail(id: number) {
    const pedido = await this.findOne(id);
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
  }

  async findPendientesPorCategoria(categoria: string) {
    if (!Object.values(TipoCategoria).includes(categoria as TipoCategoria)) {
      throw new BadRequestException(`Categoría '${categoria}' no es válida.`);
    }

    // 2. AJUSTE DE ESTADO: Tu Enum 'StatusPedido' solo tiene PENDIENTE.
    // Si agregas 'EN_PREPARACION' a tu schema, puedes añadirlo aquí.
    const estadosPendientes: StatusPedido[] = [StatusPedido.PENDIENTE];

    return this.prisma.detallePedido.findMany({
      where: {
        // 3. Filtra por el estado del pedido (usando el Enum)
        pedido: {
          status: {
            in: estadosPendientes,
          },
        },
        // 4. Filtra por la categoría del platillo (casteando string a Enum)
        platillo: {
          categoria: categoria as TipoCategoria,
        },
      },
      include: {
        platillo: true, // Incluye la info del platillo (nombre, etc.)
        pedido: {
          // Incluye solo la info necesaria del pedido (mesa, status)
          select: {
            idPedido: true,
            numMesa: true,
            status: true,
          },
        },
      },
      orderBy: {
        // 5. Ordena por el campo 'fecha' (corregido de 'createdAt')
        pedido: {
          fecha: 'asc',
        },
      },
    });
  }
}
