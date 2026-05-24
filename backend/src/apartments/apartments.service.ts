import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(number: string, provisionalPassword: string) {
    const password = await bcrypt.hash(provisionalPassword, 10);
    return this.prisma.apartment.create({
      data: { number, password },
      select: { id: true, number: true, createdAt: true },
    });
  }

  list() {
    return this.prisma.apartment.findMany({
      include: { residents: true, _count: { select: { packages: true } } },
      orderBy: { number: 'asc' },
    });
  }

  async changePassword(apartmentId: string, oldPass: string, newPass: string) {
    const ap = await this.prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!ap) throw new NotFoundException();
    if (!(await bcrypt.compare(oldPass, ap.password))) {
      throw new BadRequestException('Senha atual inválida');
    }
    await this.prisma.apartment.update({
      where: { id: apartmentId },
      data: { password: await bcrypt.hash(newPass, 10), firstAccessDone: true },
    });
  }

  async firstAccess(number: string, oldPass: string, newPass: string) {
    const ap = await this.prisma.apartment.findUnique({ where: { number } });
    if (!ap) throw new NotFoundException('Apartamento não encontrado');
    if (!(await bcrypt.compare(oldPass, ap.password))) {
      throw new BadRequestException('Senha atual inválida');
    }
    await this.prisma.apartment.update({
      where: { id: ap.id },
      data: { password: await bcrypt.hash(newPass, 10), firstAccessDone: true },
    });
    return { ok: true };
  }

  addResident(apartmentId: string, data: { name: string; phone?: string; isPrimary?: boolean }) {
    return this.prisma.resident.create({ data: { apartmentId, ...data } });
  }

  listResidents(apartmentId: string) {
    return this.prisma.resident.findMany({ where: { apartmentId } });
  }
}
