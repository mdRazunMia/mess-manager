# Mess Management System

A full-stack Mess Management System designed for Bangladeshi bachelor accommodations, hostels, and shared flats. Built with **NestJS 11** (backend) and **Next.js 16** (frontend).

---

## Features

- **Mess Setup** — Configure mess name, address, manager details
- **Member Management** — Add, edit, toggle status of members with room/rent info
- **Meal Management** — Daily breakfast/lunch/dinner tracking with configurable weights (Breakfast: 0.5, Lunch: 1, Dinner: 1)
- **Expense Management** — Categorized expenses (Market, Gas, Electricity, Internet, Water, Cleaner, Maintenance, Other)
- **Payment Management** — Record payments with methods: Cash, bKash, Nagad, Bank Transfer
- **Monthly Settlement** — Auto-calculated meal rate, utility equal share, rent, and total dues
- **PDF Invoice Generation** — Download monthly invoices per member
- **Email System** — Manual and bulk emails with templates (Monthly Bill, Payment Reminder, Custom)
- **Automatic Email Scheduler** — Monthly cron job on last day of month at 11:59 PM
- **Dashboard** — Overview cards + charts (expenses, meals, collection trend)
- **Bangla Language Support** — Toggle between English and Bengali with Bengali month names

---

## Tech Stack

### Backend
- NestJS 11
- Prisma ORM 5 + SQLite
- Nodemailer (email)
- PDFMake (invoice generation)
- NestJS Scheduler (cron jobs)

### Frontend
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- TanStack Query
- React Hook Form
- Recharts (charts)

---

## Project Structure

```
mess_management/
├── backend/          # NestJS API
│   ├── src/          # API modules
│   ├── prisma/       # Schema & migrations
│   └── dev.db        # SQLite database
└── frontend/         # Next.js app
    ├── src/app/      # Pages
    └── src/components/ui/  # Shadcn components
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

The backend runs on `http://localhost:3001`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"
PORT=3001
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run db:migrate` | Deploy Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run test` | Run Jest tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Backend — Render (Free Tier)
1. Create a new Web Service on Render
2. Root directory: `backend`
3. Build command: `npm install && npm run build && npx prisma migrate deploy && npx prisma db seed`
4. Start command: `npm run start:prod`
5. Set environment variables:
   - `DATABASE_URL=file:./dev.db`
   - `PORT=3001`
   - `NODE_ENV=production`

### Frontend — Vercel
1. Import the Git repository on Vercel
2. Root directory: `frontend`
3. Framework preset: Next.js
4. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

---

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Mess | `GET /mess`, `POST /mess`, `PUT /mess/:id`, `DELETE /mess/:id` |
| Members | `GET /members`, `POST /members`, `PUT /members/:id`, `POST /members/:id/toggle` |
| Meals | `GET /meals`, `POST /meals`, `POST /meals/bulk` |
| Expenses | `GET /expenses`, `POST /expenses`, `GET /expenses/categories` |
| Payments | `GET /payments`, `POST /payments` |
| Settlements | `GET /settlements`, `POST /settlements/generate` |
| Invoices | `GET /invoices`, `POST /invoices/generate`, `GET /invoices/:id/download` |
| Email | `POST /email/send`, `POST /email/send-bulk`, `POST /email/test-smtp` |
| Settings | `GET /settings`, `PUT /settings` |
| Dashboard | `GET /dashboard`, `GET /dashboard/stats` |

---

## Bangladesh-Specific Features

- **Payment Methods**: bKash, Nagad, Bank Transfer with transaction ID reference
- **Bangla Language**: Full UI translation support
- **Bengali Month Names**: জানুয়ারি, ফেব্রুয়ারি, মার্চ, এপ্রিল, মে, জুন, জুলাই, আগস্ট, সেপ্টেম্বর, অক্টোবর, নভেম্বর, ডিসেম্বর

---

## License

MIT
