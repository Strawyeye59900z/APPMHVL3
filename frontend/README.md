# Frontend — AppCondomínio

Next.js 14 (App Router) + Tailwind CSS.

## Setup

```bash
npm install
cp ../.env.example .env.local   # ajuste NEXT_PUBLIC_API_URL
npm run dev
```

## Rotas

- `/login/admin`, `/login/employee`, `/login/resident`
- `/admin` — dashboard síndico (apartamentos, funcionários, fila facial, relatório PDF)
- `/admin/facial-queue` — tela "Tinder" de cards
- `/portaria` — registrar encomenda
- `/morador` — minhas encomendas, residentes, reservas, fotos
