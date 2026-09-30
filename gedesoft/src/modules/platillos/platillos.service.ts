import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatilloDto } from './dto/create-platillo.dto';
import { UpdatePlatilloDto } from './dto/update-platillo.dto';

@Injectable()
export class PlatillosService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePlatilloDto) {
    return this.prisma.platillo.create({ data });
  }

  findAll() {
    return this.prisma.platillo.findMany();
  }

  findOne(id: number) {
    return this.prisma.platillo.findUnique({ where: { idPlatillo: id } });
  }

  async update(id: number, data: UpdatePlatilloDto) {
    await this.findOneOrFail(id);
    return this.prisma.platillo.update({ where: { idPlatillo: id }, data });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.platillo.delete({ where: { idPlatillo: id } });
  }

  private async findOneOrFail(id: number) {
    const platillo = await this.findOne(id);
    if (!platillo) throw new NotFoundException('Platillo no encontrado');
  }
}
