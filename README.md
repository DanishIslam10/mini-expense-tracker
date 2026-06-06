# Mini Expense Tracker

A full-stack expense tracker that lets a single user log daily spending across categories and see where their money is going. This is **Exercise 2 (Mini Expense Tracker)** from the Studio Graphene Full Stack Developer assessment. The app supports full CRUD on expenses, filtering by category and date range, a monthly summary with server-side aggregation (total spent, per-category totals, highest single expense), a category breakdown chart, locale-aware currency formatting, client- and server-side validation, and CSV export of the currently visible expenses. There is no authentication — the app assumes one user, as permitted by the brief.

---

## Live Demo

- **Frontend (Vercel):** `https://mini-expense-tracker-ten.vercel.app/`
- **Backend (Render):** `https://mini-expense-tracker-m8x8.onrender.com`

> **Note on first load:** the backend runs on Render's free tier, which sleeps after ~15 minutes of inactivity. The **first request after a period of inactivity may take 30–60 seconds** while the server wakes up; every request after that is fast. If the app looks like it is stuck loading on first open, give it up to a minute.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend runtime | **Node.js** | Required by the brief. |
| Web framework | **Express 5** | Minimal, explicit, and easy to reason about for a small REST API. |
| Backend language | **JavaScript (ES Modules)** | No build step needed; `"type": "module"` for native `import`/`export`. |
| Storage | **JSON file** (`fs/promises`) | Satisfies the "persist across restarts" goal without the setup overhead of a database. All file access is isolated behind a small store module so it could be swapped for SQLite/Postgres without touching business logic. |
| Frontend library | **React 19** | Required by the brief. Functional components and hooks only — no class components. |
| Frontend build tool | **Vite 8** | Fast dev server and build; simpler than CRA (now deprecated) and lighter than Next.js for a pure SPA. |
| State / data | **Plain React hooks + axios** | The app has a single shared piece of state (the expense list, owned by `App`). Redux or Context would be over-engineering at this scale. |
| HTTP client | **axios** | Centralised in one instance; throws on 4xx/5xx, which maps cleanly onto the backend's error responses. |
| Styling | **Tailwind CSS v4** | Utility-first styling with a small custom theme (brand colour + display font) defined in CSS. |
| Charts | **Recharts** | Declarative donut chart for the "spending by category" view. |

---

## How to Run Locally

These steps assume you have **only Node.js installed** (Node 18+ recommended). The project is a monorepo with a `/server` and a `/client` folder; you run them in two terminals.

> Lockfiles are intentionally not committed, so `npm install` will resolve current compatible versions.

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Start the backend

```bash
cd server
npm install
```

Create a file named `.env` inside `server/`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
```

Then start it:

```bash
npm run dev      # development, auto-restarts on changes (nodemon)
# or
npm start        # production-style, plain node
```

The API will be available at `http://localhost:5000`. The expense data is stored in `server/data/expenses.json`, which is created automatically (as an empty array) on first run.

### 3. Start the frontend

In a **second terminal**, from the repository root:

```bash
cd client
npm install
```

Create a file named `.env` inside `client/`:

```
VITE_API_URL=http://localhost:5000/api/v1
```

Then start it:

```bash
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). The frontend will talk to the local backend.

> **Why the `VITE_` prefix?** Vite only exposes environment variables prefixed with `VITE_` to browser code, and it inlines them at **build** time. If you change `VITE_API_URL`, you must restart the dev server (or rebuild) for it to take effect.

---

## API Documentation

Base URL: `/api/v1`

All responses share a consistent envelope:

- **Success:** `{ "success": true, ...data }`
- **Failure:** `{ "success": false, "message": "<reason>" }`

### Expense object shape

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "amount": 250,
  "category": "Food",
  "date": "2026-06-01",
  "note": "Lunch",
  "createdAt": "2026-06-06T05:08:44.997Z"
}
```

Valid categories: `Food`, `Transport`, `Bills`, `Entertainment`, `Other`.

---

### `GET /api/v1/expenses`

List all expenses, sorted newest first (by `date`, then `createdAt`). Supports optional filters via query params.

**Query parameters (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | One of the valid categories. |
| `from` | `YYYY-MM-DD` | Include expenses on or after this date. |
| `to` | `YYYY-MM-DD` | Include expenses on or before this date. |

**Example:** `GET /api/v1/expenses?category=Food&from=2026-06-01&to=2026-06-30`

**Response — 200 OK**

```json
{
  "success": true,
  "expenses": [ { "id": "...", "amount": 150, "category": "Food", "date": "2026-06-06", "note": "Groceries", "createdAt": "..." } ]
}
```

---

### `GET /api/v1/expenses/summary`

Returns aggregated figures for the **current month**, computed server-side.

**Response — 200 OK**

```json
{
  "success": true,
  "summary": {
    "month": "2026-06",
    "totalThisMonth": 7559,
    "totalsByCategory": {
      "Food": 400,
      "Transport": 140,
      "Bills": 5700,
      "Entertainment": 320,
      "Other": 999
    },
    "highestExpense": { "id": "...", "amount": 4500, "category": "Bills", "date": "2026-06-04", "note": "Rent share", "createdAt": "..." }
  }
}
```

`highestExpense` is `null` when there are no expenses in the current month.

---

### `POST /api/v1/expenses`

Create a new expense.

**Request body**

```json
{
  "amount": 250,
  "category": "Food",
  "date": "2026-06-01",
  "note": "Lunch"
}
```

- `amount` — required, positive number.
- `category` — required, one of the valid categories.
- `date` — required, valid date, not in the future.
- `note` — optional string.

**Response — 201 Created**

```json
{ "success": true, "expense": { "id": "...", "amount": 250, "category": "Food", "date": "2026-06-01", "note": "Lunch", "createdAt": "..." } }
```

---

### `PUT /api/v1/expenses/:id`

Update an existing expense. The full body is required (same validation rules as create); `id` and `createdAt` are preserved.

**Response — 200 OK**

```json
{ "success": true, "expense": { "id": "...", "amount": 300, "category": "Food", "date": "2026-06-01", "note": "Lunch (updated)", "createdAt": "..." } }
```

---

### `DELETE /api/v1/expenses/:id`

Delete an expense by id.

**Response — 200 OK** — returns the deleted expense.

```json
{ "success": true, "expense": { "id": "...", "amount": 300, "category": "Food", "date": "2026-06-01", "note": "...", "createdAt": "..." } }
```

---

### Error responses

| Status | When | Body |
|--------|------|------|
| `400 Bad Request` | Validation failed (missing/negative amount, invalid or missing category, missing/invalid/future date). | `{ "success": false, "message": "Amount must be a positive number" }` |
| `404 Not Found` | Updating or deleting an id that does not exist. | `{ "success": false, "message": "Expense not found" }` |
| `500 Internal Server Error` | Unexpected server error. | `{ "success": false, "message": "<error message>" }` |

### Health check

`GET /` returns a plain-text confirmation that the server is running and which CORS origin it is configured for.

---

## Project Structure

```
.
├── client/                         # React + Vite frontend (SPA)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js             # Single configured axios instance (base URL lives here)
│   │   │   └── expenses.js          # API client: one function per endpoint, unwraps the response envelope
│   │   ├── components/
│   │   │   ├── SummaryCards.jsx     # Four headline metric cards from /summary
│   │   │   ├── CategoryChart.jsx    # Recharts donut of spending by category
│   │   │   ├── ExpenseForm.jsx      # Add + edit form with client-side validation
│   │   │   ├── FilterBar.jsx        # Category + date-range filters with month presets
│   │   │   └── ExpenseTable.jsx     # Expense list (table on desktop, cards on mobile) with inline delete confirm
│   │   ├── utils/
│   │   │   ├── format.js            # Currency (Intl) and date formatting
│   │   │   ├── categories.js        # Category list + colours (shared by pills and chart)
│   │   │   └── exportCsv.js         # Client-side CSV export of the visible list
│   │   ├── App.jsx                  # Owns all shared state; only component that calls the API
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css               # Tailwind import + theme (brand colour, fonts)
│   └── vite.config.js
│
├── server/                         # Node.js + Express backend (REST API)
│   └── src/
│       ├── config/
│       │   └── constants.js         # Single source of truth for valid categories
│       ├── store/
│       │   └── expense.store.js     # JSON-file read/write (the data-access layer)
│       ├── services/
│       │   └── expense.service.js   # Business logic: validation, filtering, aggregation, CRUD
│       ├── controllers/
│       │   └── expense.controller.js# HTTP layer: reads req, calls service, shapes response
│       ├── routes/
│       │   └── expense.routes.js     # Maps verbs/paths to controllers
│       └── index.js                 # App entry: CORS, JSON parsing, route mounting, server start
│
└── README.md
```

The backend follows a **layered structure** — `routes → controllers → services → store` — so that HTTP concerns, business logic, and data access are cleanly separated. The frontend mirrors this discipline: components are presentational and receive data via props, while `App` owns state and the `api/` modules are the only code that talks to the backend.

---

## What Works

- Add, view, edit, and delete expenses (full CRUD), with a confirmation step before deletion.
- Expenses sorted newest-first.
- Filter by category and by date range, including **This month / Last month** presets and a custom range.
- Monthly summary: total spent this month, total per category, and the highest single expense — all aggregated **server-side**.
- Donut chart of spending by category.
- Currency formatting with Indian locale grouping (e.g. `₹1,234.50`) via `Intl.NumberFormat`.
- Validation on **both** the client (instant feedback) and the server (the real guard): no negative amounts, no future dates, category required.
- Loading skeletons, an error banner with retry, and context-aware empty states.
- Responsive layout (table collapses to cards on mobile).
- **Bonus:** CSV export of the currently visible (filtered) expenses, generated client-side with proper field escaping.

---

## Next Steps / What I'd Improve With More Time

- **Persistence on hosting.** Storage is a JSON file, and Render's free tier has an **ephemeral filesystem** — data resets when the instance sleeps, restarts, or redeploys. In production I'd move to SQLite on a Render persistent disk, or a hosted database (Postgres/Mongo). The store module is already isolated so this swap would not touch the service or controller layers.
- **Automated tests.** I'd add a few meaningful backend tests (Vitest/Jest + Supertest) covering the validation rules, the monthly-summary aggregation, and the 404 paths. These are the highest-value things to test.
- **Per-category budgets** with a visual over-budget indicator (a listed bonus I chose to skip for time).
- **Pagination** on the expense list for large datasets, and optional client-side column sorting (amount/date).
- **Optimistic updates** instead of refetching after every mutation, for a snappier feel — traded off here in favour of guaranteed consistency with the server-computed summary.
- **Accessibility pass** — focus management on the inline delete confirmation, ARIA labels, and keyboard-only flows.

---

## A Note on AI Assistance

In line with the assessment's ground rules: I used an AI assistant while building this, primarily to talk through architecture decisions, speed up boilerplate, and review code. Every file was written to match a consistent structure I understand and can walk through, and I'm happy to explain any part of it in the follow-up discussion.
