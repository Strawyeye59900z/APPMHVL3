import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(id: string, name: string, provisionalPassword: string) {
    return this.prisma.employee.create({
      data: { id, name, password: await bcrypt.hash(provisionalPassword, 10) },
      select: { id: true, name: true, createdAt: true },
    });
  }

  list() {
    return this.prisma.employee.findMany({
      select: { id: true, name: true, photoUrl: true, mustChangePass: true, createdAt: true },
    });
  }

  async firstAccess(employeeId: string, newPassword: string, photoUrl: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException();
    if (!emp.mustChangePass) throw new BadRequestException('1º acesso já concluído');
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        password: await bcrypt.hash(newPassword, 10),
        photoUrl,
        mustChangePass: false,
      },
      select: { id: true, name: true, photoUrl: true },
    });
  }
}
