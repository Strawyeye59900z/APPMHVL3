import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../auth/jwt-auth.guard';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private svc: EmployeesService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: { id: string; name: string; password: string }) {
    return this.svc.create(body.id, body.name, body.password);
  }

  @Get()
  @Roles('ADMIN')
  list() {
    return this.svc.list();
  }

  @Put('me/first-access')
  @Roles('EMPLOYEE')
  firstAccess(@Req() req: any, @Body() body: { newPassword: string; photoUrl: string }) {
    return this.svc.firstAccess(req.user.sub, body.newPassword, body.photoUrl);
  }
}
