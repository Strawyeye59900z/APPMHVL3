import { Injectable, NotFoundException } from '@nestjs/common';
import { PackageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

const TYPE_LABEL: Record<PackageType, string> = {
  BOX: 'Caixa',
  ENVELOPE: 'Envelope',
  BAG: 'Sacola',
};

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService, private wa: WhatsappService) {}

  async receive(employeeId: string, dto: { apartmentId: string; residentId: string; type: PackageType }) {
    const pkg = await this.prisma.package.create({
      data: { ...dto, employeeId },
      include: { resident: true, apartment: true },
    });
    if (pkg.resident.phone) {
      const hora = pkg.receivedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const msg = `Olá, ${pkg.resident.name}! Uma encomenda tipo ${TYPE_LABEL[pkg.type]} foi recebida na portaria hoje às ${hora}.`;
      this.wa.sendText(pkg.resident.phone, msg);
    }
    return pkg;
  }

  listPending() {
    return this.prisma.package.findMany({
      where: { status: 'PENDING' },
      include: { resident: true, apartment: true, employee: { select: { id: true, name: true } } },
      orderBy: { receivedAt: 'desc' },
    });
  }

  listForApartment(apartmentId: string) {
    return this.prisma.package.findMany({
      where: { apartmentId },
      include: { resident: true, employee: { select: { id: true, name: true } } },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async pickup(apartmentId: string, packageId: string) {
    const pkg = await this.prisma.package.findFirst({ where: { id: packageId, apartmentId } });
    if (!pkg) throw new NotFoundException();
    return this.prisma.package.update({
      where: { id: packageId },
      data: { status: 'PICKED_UP', pickedUpAt: new Date() },
    });
  }
}
