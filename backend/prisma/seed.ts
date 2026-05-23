import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@condominio.local' },
    update: {},
    create: {
      email: 'admin@condominio.local',
      password,
      name: 'Síndico',
    },
  });
  console.log('Seed OK — admin@condominio.local / admin123');
}

main().finally(() => prisma.$disconnect());
