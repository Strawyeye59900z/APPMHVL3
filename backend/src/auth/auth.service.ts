import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'RESIDENT';
  name: string;
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private sign(payload: JwtPayload) {
    return { access_token: this.jwt.sign(payload), user: payload };
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.sign({ sub: admin.id, role: 'ADMIN', name: admin.name });
  }

  async loginEmployee(id: string, password: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp || !(await bcrypt.compare(password, emp.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return {
      ...this.sign({ sub: emp.id, role: 'EMPLOYEE', name: emp.name }),
      mustChangePass: emp.mustChangePass,
      hasPhoto: !!emp.photoUrl,
    };
  }

  async loginResident(apartmentNumber: string, password: string) {
    const ap = await this.prisma.apartment.findUnique({ where: { number: apartmentNumber } });
    if (!ap || !(await bcrypt.compare(password, ap.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return {
      ...this.sign({ sub: ap.id, role: 'RESIDENT', name: `AP ${ap.number}` }),
      firstAccessDone: ap.firstAccessDone,
    };
  }
}
