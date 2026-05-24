import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@condominio.local' },
    update: {},
    create: { email: 'admin@condominio.local', password: adminPass, name: 'Síndico' },
  });

  const aptPass = await bcrypt.hash('1234', 10);
  const FLOORS = 14;
  const UNITS_PER_FLOOR = 4;

  for (let floor = 1; floor <= FLOORS; floor++) {
    for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
      // floor=1,unit=1 → "101"; floor=10,unit=1 → "1001"; floor=14,unit=4 → "1404"
      const aptNumber = `${floor}${String(unit).padStart(2, '0')}`;
      await prisma.apartment.upsert({
        where: { number: aptNumber },
        update: {},
        create: { number: aptNumber, password: aptPass },
      });
    }
  }

  console.log('Seed OK — admin@condominio.local / admin123 · 56 apartamentos criados (senha: 1234)');
}

main().finally(() => prisma.$disconnect());
