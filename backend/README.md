# Backend — AppCondomínio

NestJS + Prisma + PostgreSQL.

## Setup

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

## Estrutura

```
src/
├── auth/             # Login dos 3 perfis (admin, funcionário, morador) + JWT
├── prisma/           # PrismaService
├── apartments/       # CRUD apartamentos + moradores
├── employees/        # CRUD funcionários
├── faces/            # Upload/validação foto + integração Google Drive
├── facial-queue/     # Fila de cards "Tinder" para o síndico
├── packages/         # Encomendas + disparo WhatsApp
├── reservations/     # Quadra/churrasqueira/salão + PDF
├── whatsapp/         # Cliente Evolution API
└── drive/            # Cliente Google Drive
```

## Seed

Cria um admin inicial:

- E-mail: `admin@condominio.local`
- Senha: `admin123`
