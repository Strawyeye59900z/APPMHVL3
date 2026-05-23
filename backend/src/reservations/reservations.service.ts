import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservableSpace } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const COURT_DAILY_HOUR_LIMIT = 4;

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private dayBounds(d: Date) {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  async create(
    apartmentId: string,
    createdById: string,
    dto: { space: ReservableSpace; startsAt: string; endsAt: string },
  ) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) throw new BadRequestException('Intervalo inválido');

    if (dto.space === 'COURT') {
      const durHours = (endsAt.getTime() - startsAt.getTime()) / 3_600_000;
      if (!Number.isInteger(durHours) || durHours < 1) {
        throw new BadRequestException('Quadra: reserva por blocos inteiros de 1h');
      }
      const { start, end } = this.dayBounds(startsAt);
      const today = await this.prisma.reservation.findMany({
        where: {
          apartmentId,
          space: 'COURT',
          status: 'ACTIVE',
          startsAt: { gte: start, lt: end },
        },
      });
      const usedHours = today.reduce(
        (acc, r) => acc + (r.endsAt.getTime() - r.startsAt.getTime()) / 3_600_000,
        0,
      );
      if (usedHours + durHours > COURT_DAILY_HOUR_LIMIT) {
        throw new BadRequestException(`Limite de ${COURT_DAILY_HOUR_LIMIT}h/dia atingido`);
      }
    } else {
      const { start, end } = this.dayBounds(startsAt);
      startsAt.setTime(start.getTime());
      endsAt.setTime(end.getTime());
    }

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        space: dto.space,
        status: 'ACTIVE',
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
    });
    if (conflict) throw new BadRequestException('Horário/dia indisponível');

    return this.prisma.reservation.create({
      data: { apartmentId, createdById, space: dto.space, startsAt, endsAt },
    });
  }

  list(filter?: { space?: ReservableSpace; from?: Date; to?: Date }) {
    return this.prisma.reservation.findMany({
      where: {
        status: 'ACTIVE',
        space: filter?.space,
        startsAt: filter?.from ? { gte: filter.from } : undefined,
        endsAt: filter?.to ? { lte: filter.to } : undefined,
      },
      include: { apartment: { select: { number: true } } },
      orderBy: { startsAt: 'asc' },
    });
  }

  async cancel(reservationId: string, user: { sub: string; role: string }) {
    const r = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!r) throw new NotFoundException();
    const isOwner = user.role === 'RESIDENT' && r.apartmentId === user.sub;
    if (!isOwner && user.role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });
  }
}
