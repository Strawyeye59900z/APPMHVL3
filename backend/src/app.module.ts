import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { EmployeesModule } from './employees/employees.module';
import { FacesModule } from './faces/faces.module';
import { FacialQueueModule } from './facial-queue/facial-queue.module';
import { PackagesModule } from './packages/packages.module';
import { ReservationsModule } from './reservations/reservations.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { DriveModule } from './drive/drive.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ApartmentsModule,
    EmployeesModule,
    FacesModule,
    FacialQueueModule,
    PackagesModule,
    ReservationsModule,
    WhatsappModule,
    DriveModule,
  ],
})
export class AppModule {}
