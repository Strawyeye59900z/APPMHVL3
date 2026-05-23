import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { ApartmentsService } from './apartments.service';

@Controller('apartments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApartmentsController {
  constructor(private svc: ApartmentsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: { number: string; password: string }) {
    return this.svc.create(body.number, body.password);
  }

  @Get()
  @Roles('ADMIN')
  list() {
    return this.svc.list();
  }

  @Put('me/password')
  @Roles('RESIDENT')
  changePassword(@Req() req: any, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.svc.changePassword(req.user.sub, body.oldPassword, body.newPassword);
  }

  @Post('me/residents')
  @Roles('RESIDENT')
  addResident(@Req() req: any, @Body() body: { name: string; phone?: string; isPrimary?: boolean }) {
    return this.svc.addResident(req.user.sub, body);
  }

  @Get('me/residents')
  @Roles('RESIDENT')
  listResidents(@Req() req: any) {
    return this.svc.listResidents(req.user.sub);
  }

  @Get(':id/residents')
  @Roles('ADMIN')
  listResidentsAdmin(@Param('id') id: string) {
    return this.svc.listResidents(id);
  }
}
