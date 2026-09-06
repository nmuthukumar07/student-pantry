# Student Pantry

Student Pantry helps college students reserve affordable pantry essentials before they reach the pantry. Students can browse everyday food, drinks, study snacks, personal-care items, and bundles, add them to a basket, and reserve a pickup slot. This reduces queue time so students do not miss classes, exams, or study sessions.

## Product Problem Statement

College students often lose valuable class and exam-preparation time standing in queues to buy basic pantry food and essentials. Student Pantry provides a simple campus ordering and pickup experience: browse in advance, reserve items, and collect them at a scheduled campus pickup point.

## Prompt Coverage

- Customer discovery experience for pantry essentials
- Search/filter categories and student-priced bundles
- Basket and pickup reservation flow
- API foundation with Express
- PostgreSQL data model with Prisma
- Customer/admin authentication with JWT
- Product management APIs for admins
- Order creation, stock checks, and order status updates
- API-first catalog with offline mock fallback

## Run Locally

Node.js 20+ and PostgreSQL 17+ are required for the database-backed app.

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm start
```

Open `http://localhost:4000`.

## Admin Demo Account

Use this seeded account for the admin API/admin workbench:

- Email: `admin@studentpantry.local`
- Password: `StudentPantryAdmin2026!`

Set `ADMIN_PASSWORD` before running the seed command to use a different password. Do not use the demo password in production.