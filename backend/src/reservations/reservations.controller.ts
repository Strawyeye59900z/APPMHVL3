import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';
type ReservableSpace = 'COURT' | 'BBQ' | 'HALL';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private svc: ReservationsService) {}

  @Post()
  @Roles('RESIDENT')
  create(
    @Req() req: any,
    @Body() body: { space: ReservableSpace; startsAt: string; endsAt: string },
  ) {
    return this.svc.create(req.user.sub, req.user.sub, body);
  }

  @Get()
  @Roles('ADMIN', 'RESIDENT')
  list(@Query('space') space?: ReservableSpace, @Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.list({
      space,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Delete(':id')
  @Roles('RESIDENT', 'ADMIN')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.svc.cancel(id, req.user);
  }

  @Get('report.pdf')
  @Roles('ADMIN')
  async pdf(@Res() res: Response, @Query('days') days = '30') {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + Number(days));
    const items = await this.svc.list({ from, to });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reservas.pdf"');
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('Relatório de Reservas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Período: ${from.toLocaleDateString('pt-BR')} a ${to.toLocaleDateString('pt-BR')}`);
    doc.moveDown();
    for (const r of items) {
      doc.fontSize(11).text(
        `${r.startsAt.toLocaleString('pt-BR')} — ${r.endsAt.toLocaleString('pt-BR')}  |  ${r.space}  |  AP ${r.apartment.number}`,
      );
    }
    if (!items.length) doc.text('Nenhuma reserva no período.');
    doc.end();
  }
}
