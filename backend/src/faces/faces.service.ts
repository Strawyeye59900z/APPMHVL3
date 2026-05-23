import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriveService } from '../drive/drive.service';

const MAX_BYTES = Number(process.env.MAX_PHOTO_BYTES || 1_048_576);

@Injectable()
export class FacesService {
  constructor(private prisma: PrismaService, private drive: DriveService) {}

  async uploadResidentPhoto(apartmentId: string, residentId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo ausente');
    if (file.size > MAX_BYTES) {
      throw new BadRequestException(`Foto excede ${MAX_BYTES} bytes`);
    }
    const resident = await this.prisma.resident.findFirst({
      where: { id: residentId, apartmentId },
      include: { apartment: true },
    });
    if (!resident) throw new NotFoundException('Morador não encontrado');

    const fileName = `AP${resident.apartment.number}_${resident.name.replace(/\s+/g, '_')}.jpg`;
    const driveId = await this.drive.uploadResidentPhoto(
      resident.apartment.number,
      fileName,
      file.buffer,
    );
    return this.prisma.resident.update({
      where: { id: residentId },
      data: { photoDriveId: driveId, facialStatus: 'PENDING' },
    });
  }
}
