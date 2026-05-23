import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('admin/login')
  admin(@Body() body: { email: string; password: string }) {
    return this.auth.loginAdmin(body.email, body.password);
  }

  @Post('employee/login')
  employee(@Body() body: { id: string; password: string }) {
    return this.auth.loginEmployee(body.id, body.password);
  }

  @Post('resident/login')
  resident(@Body() body: { apartment: string; password: string }) {
    return this.auth.loginResident(body.apartment, body.password);
  }
}
