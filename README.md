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

Node.js 20+ is required for the local database-backed app. Local development uses SQLite so the project can run without installing a separate database server.

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm start
```

For production, change `DATABASE_URL` and the Prisma provider to a managed PostgreSQL database.

Open `http://localhost:4000`.

## Admin Demo Account

The seed command creates the admin account using the private `ADMIN_PASSWORD` value in your local `.env`. Do not commit or share that password. Use the staff email configured by your deployment environment.