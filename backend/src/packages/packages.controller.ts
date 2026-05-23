import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
type PackageType = 'BOX' | 'ENVELOPE' | 'BAG';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { PackagesService } from './packages.service';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(private svc: PackagesService) {}

  @Post()
  @Roles('EMPLOYEE')
  receive(
    @Req() req: any,
    @Body() body: { apartmentId: string; residentId: string; type: PackageType },
  ) {
    return this.svc.receive(req.user.sub, body);
  }

  @Get('pending')
  @Roles('EMPLOYEE', 'ADMIN')
  pending() {
    return this.svc.listPending();
  }

  @Get('me')
  @Roles('RESIDENT')
  mine(@Req() req: any) {
    return this.svc.listForApartment(req.user.sub);
  }

  @Post('me/:id/pickup')
  @Roles('RESIDENT')
  pickup(@Req() req: any, @Param('id') id: string) {
    return this.svc.pickup(req.user.sub, id);
  }
}
