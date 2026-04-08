# ReceiptAI - Receipt Scanner & Budget Planner

Full-stack web app for scanning receipts, extracting itemized expenses, and
tracking category-based budgets with user authentication.

## Features

- Email/password authentication (bcrypt)
- Google Sign-In (ID token verification on backend)
- Per-user sessions with token auth
- Receipt image upload and OCR extraction (EasyOCR)
- Automatic parsing:
  - merchant
  - date
  - total and tax
  - line items (name, qty, price)
  - category prediction
- Expense management:
  - list/search/filter expenses
  - delete expense
  - view parsed items per expense
- Budget configuration:
  - user selects categories
  - healthcare optional
  - custom monthly limits
- Budget enforcement flow:
  - user must complete budget setup first
- Analytics dashboard:
  - category totals
  - monthly trend
  - top merchant
- Forecast and anomaly screens (rule/simulation-based)
- Modern UI with dark theme and responsive layout

## Tech Stack

### Frontend

- React + Vite
- Axios
- Recharts
- Lucide icons
- Google OAuth React SDK

### Backend

- Flask + Flask-CORS
- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL (Neon compatible)
- EasyOCR + Pillow + NumPy

## Backend Details

### Database Models

- `User`
  - `id`, `email`, `password_hash`, `name`, `created_at`
- `UserSession`
  - `token`, `user_id`, `created_at`
- `Expense`
  - `id`, `user_id`, `merchant`, `amount`, `category`, `date`, `tax`,
    `confidence`, `currency`, `source`, `created_at`
- `ExpenseItem`
  - `id`, `expense_id`, `name`, `price`, `qty`
- `Budget`
  - `id`, `user_id`, `category`, `limit`

### API (Core)

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/google`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Receipts & Expenses
  - `POST /api/receipts/scan`
  - `GET /api/expenses`
  - `DELETE /api/expenses/<id>`
- Budgets
  - `GET /api/settings/budget-config`
  - `PUT /api/settings/budget-config`
  - `GET /api/budget`
  - `PUT /api/budget/<category>`
- Insights
  - `GET /api/analytics/summary`
  - `GET /api/forecast`
  - `GET /api/anomalies`
- Health
  - `GET /api/health`

## Setup

## 1) Backend

```bash
cd backend
copy .env.example .env
pip install -r requirements.txt
alembic upgrade head
python app.py
```

Backend runs at `http://localhost:5000`

Required backend envs in `backend/.env`:

- `DATABASE_URL` - Neon/Postgres connection string
- `GOOGLE_CLIENT_ID` - Google OAuth Web client ID
- `AUTO_CREATE_TABLES` - optional (`false` recommended with Alembic)

## 2) Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Required frontend envs in `frontend/.env`:

- `VITE_GOOGLE_CLIENT_ID` - same value as backend `GOOGLE_CLIENT_ID`
- `VITE_API_BASE_URL` - backend API base URL (example:
  `http://localhost:5000/api`)

## Deployment Notes

- Frontend: Vercel/Netlify
- Backend: any Python host (Render/Koyeb/etc.)
- Database: Neon Postgres
- Always configure:
  - backend `DATABASE_URL`
  - backend `GOOGLE_CLIENT_ID`
  - frontend `VITE_GOOGLE_CLIENT_ID`
  - frontend `VITE_API_BASE_URL`
- Run migrations on deploy:
  - `alembic upgrade head`

## Project Structure

```txt
Reciept Scanner/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
└── README.md
```
