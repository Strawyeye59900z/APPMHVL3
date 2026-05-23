import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { FacialQueueService } from './facial-queue.service';

@Controller('facial-queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FacialQueueController {
  constructor(private svc: FacialQueueService) {}

  @Get('next')
  next() {
    return this.svc.next();
  }

  @Get(':residentId/download')
  async download(@Param('residentId') id: string, @Res() res: Response) {
    const { buffer, fileName } = await this.svc.downloadPhoto(id);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  @Post(':residentId/registered')
  markRegistered(@Param('residentId') id: string) {
    return this.svc.markRegistered(id);
  }
}
