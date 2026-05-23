import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriveService } from '../drive/drive.service';

@Injectable()
export class FacialQueueService {
  constructor(private prisma: PrismaService, private drive: DriveService) {}

  async next() {
    const resident = await this.prisma.resident.findFirst({
      where: { facialStatus: 'PENDING', photoDriveId: { not: null } },
      orderBy: { createdAt: 'asc' },
      include: { apartment: { select: { number: true } } },
    });
    if (!resident) return null;
    return {
      id: resident.id,
      name: resident.name,
      apartmentNumber: resident.apartment.number,
      photoDriveId: resident.photoDriveId,
    };
  }

  async downloadPhoto(residentId: string) {
    const r = await this.prisma.resident.findUnique({
      where: { id: residentId },
      include: { apartment: true },
    });
    if (!r?.photoDriveId) throw new NotFoundException();
    const buffer = await this.drive.downloadFile(r.photoDriveId);
    const fileName = `AP${r.apartment.number}_${r.name.replace(/\s+/g, '_')}.jpg`;
    return { buffer, fileName };
  }

  async markRegistered(residentId: string) {
    return this.prisma.resident.update({
      where: { id: residentId },
      data: { facialStatus: 'REGISTERED' },
    });
  }
}
