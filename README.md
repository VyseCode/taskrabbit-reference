# Taskly — TaskRabbit-style local services marketplace

A reference implementation inspired by **TaskRabbit**: a responsive Next.js marketplace where clients post local tasks, taskers submit offers, and completed work is reviewed. Built with Next.js 16.4.6 App Router, React 19, Tailwind 4, TypeScript, MongoDB/Mongoose, bcryptjs, jose JWT HTTP-only cookies, and zod.

## Features

- **Roles:** clients post tasks; taskers maintain profiles with skills, hourly rate, location, bio, availability and an aggregate rating.
- **Tasks:** category, title, description, location, date and budget; status flows `open → assigned → in_progress → completed`, with `cancelled` available from open/assigned/in_progress.
- **Offers:** taskers submit price, estimated hours and a message; clients accept exactly one offer (the rest are auto-rejected), reject or taskers withdraw; status transitions are guarded server-side.
- **Reviews:** one review per completed task, written by the task owner; the tasker's aggregate rating is updated atomically.
- **Discovery:** task search with filters/sorting/pagination, tasker search by skill, rate range, rating, availability and location, plus category browsing.
- **Dashboards:** client tasks/offers/spend and tasker offers/earnings/completed jobs.
- **UX:** polished responsive cards, consistent design tokens, loading/empty/error states, accessible labels and focus rings.

## Setup

```bash
npm install
cp .env.example .env.local
# start MongoDB locally (mongod) or point MONGODB_URI at your cluster
npm run seed
npm run dev        # http://localhost:3000
```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/taskrabbit_ref` | MongoDB connection string |
| `JWT_SECRET` | dev-only fallback | HMAC secret for session JWT (set a long random value in production) |

### Seed

```bash
npm run seed
```

The seed script wipes **only** the `taskrabbit_ref` database, builds indexes, and is safely re-runnable. It creates 7 users, 4 tasker profiles, 9 tasks (all statuses), 12 offers (all statuses) and 3 reviews. All demo passwords are `password123`.

### Demo accounts

| Email | Role | Notes |
| --- | --- | --- |
| `priya@example.com` | client | Open tasks, one accepted offer pending completion |
| `marcus@example.com` | client | Completed task already reviewed |
| `sofia@example.com` | client | Assigned task ready for the workflow |
| `daniel@example.com` | tasker | Posted his own task (own-task guard demo) |
| `emma@example.com` | tasker | 4.5 rating from 2 reviews |
| `oliver@example.com` | tasker | Accepted offer on an assigned task |
| `ava@example.com` | tasker | Busy availability, lower rate |

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create account (`name`, `email`, `password`, `role`) |
| POST | `/api/auth/login` | – | Sign in, sets HTTP-only cookie |
| POST | `/api/auth/logout` | – | Clear session cookie |
| GET | `/api/auth/me` | – | Current user or `null` |
| GET | `/api/tasks` | – | List tasks; `status`, `category`, `clientId`, `q`, `sort`, `page`, `limit` |
| POST | `/api/tasks` | ✓ | Post a task (future `date` required) |
| GET | `/api/tasks/[id]` | – | Task detail |
| PATCH | `/api/tasks/[id]` | owner | Edit an open task |
| DELETE | `/api/tasks/[id]` | owner | Cancel a task |
| POST | `/api/tasks/[id]/status` | owner | Guarded status transition |
| GET | `/api/tasks/[id]/offers` | ✓ | Offers (owner sees all; others see own + accepted) |
| POST | `/api/tasks/[id]/offers` | ✓ | Submit an offer |
| POST | `/api/offers/[id]/accept` | owner | Accept one pending offer (409 on second accept) |
| POST | `/api/offers/[id]/reject` | owner | Reject a pending offer |
| POST | `/api/offers/[id]/withdraw` | tasker | Withdraw own pending offer |
| GET | `/api/taskers` | – | Search/filter/sort taskers |
| GET | `/api/taskers/[id]` | – | Tasker profile plus reviews (`id` = user id) |
| GET | `/api/taskers/me` | ✓ | Own tasker profile |
| POST / PATCH | `/api/taskers/me` | ✓ | Create / update tasker profile |
| GET | `/api/categories` | – | Categories with task counts |
| GET | `/api/reviews` | – | Reviews by `taskId` or `taskerId` |
| POST | `/api/reviews` | owner | Review a completed task (one per task) |
| GET | `/api/dashboard` | ✓ | Client + tasker dashboard data |

### Verification

```bash
npm run lint && npm run typecheck && npm run build && npm run seed
npm run start -- -p 3217 &
node scripts/verify.mjs
```

`scripts/verify.mjs` drives 104 `curl` assertions covering auth codes, list filters/pagination/empty states, every mutation (success, 400, 401/403, 404), the full happy path, all assignment edge cases and page statuses.

## Local deploy

```bash
npm run build && npm start -- -p 3217
```

Then open `http://localhost:3217`. A production deployment needs MongoDB reachable via `MONGODB_URI` and a strong `JWT_SECRET`.

## Known limitations

- **No payments, messaging, identity verification or geolocation.** Distances are not computed; location is a free-text filter.
- **Role capabilities are intentionally permissive:** any signed-in user may post a task and make offers. The own-task guard (`offer.tasker !== task.client`) prevents self-hiring, and dashboards show both perspectives. Roles are primarily profile/dashboard labels.
- **Invalid resource pages render the 404 UI with HTTP 200** because Next.js streams the authenticated shell before `notFound()` resolves; API detail routes and truly unknown routes return a real 404.
- **Rating aggregation uses an atomic pipeline update without a multi-document transaction**, so a rare failure between review creation and profile update could leave them out of sync (standalone MongoDB has no replica-set transactions here).
- Session cookies use `secure` only when `NODE_ENV=production`; local HTTP testing is therefore permitted.

## Top 3 improvements

1. Add MongoDB replica-set transactions around review creation + aggregate updates and offer acceptance + auto-rejection.
2. Add real-time notifications and in-app messaging between client and tasker.
3. Add map-based location search, identity verification and an escrow/payment step after offer acceptance.
