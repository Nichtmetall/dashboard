# Personal Dashboard

A modern, minimalist **personal dashboard** built as a single-page application.
It connects to your Google account and surfaces your **Calendar**, **Tasks**,
**Drive** and **Photos** in one clean, responsive overview.

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, `src/`) |
| Language       | TypeScript (strict)                                 |
| Auth           | [Auth.js / NextAuth v5](https://authjs.dev) + Google OAuth |
| Database / ORM | PostgreSQL + [Prisma](https://www.prisma.io)        |
| Google APIs    | [`googleapis`](https://www.npmjs.com/package/googleapis) (server-side) |
| Styling        | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Icons          | [lucide-react](https://lucide.dev)                  |

## Features

- **Google login** via OAuth with offline access (refresh tokens).
- **Encrypted token storage** — access & refresh tokens are encrypted at rest
  (AES-256-GCM) in PostgreSQL via a transparent Prisma Client extension.
- **Calendar widget** — today's and tomorrow's events.
- **Tasks widget** — list, complete/re-open and add tasks (Server Actions).
- **Drive widget** — most recently modified files with direct links.
- **Photos widget** — a small gallery + a randomised "memory of the day".
- Responsive shadcn/ui card grid with streaming (`Suspense`) skeletons.

## Architecture

```
src/
├─ auth.ts                     # Auth.js (NextAuth v5) configuration
├─ types/next-auth.d.ts        # Session type augmentation (user.id)
├─ app/
│  ├─ layout.tsx               # Root layout + global styles
│  ├─ globals.css              # Tailwind v4 + shadcn theme tokens
│  ├─ page.tsx                 # Dashboard (auth-guarded, force-dynamic)
│  ├─ login/page.tsx           # Sign-in screen
│  ├─ api/auth/[...nextauth]/  # Auth.js route handler
│  └─ actions/                 # Server Actions (auth, tasks)
├─ lib/
│  ├─ crypto.ts                # AES-256-GCM helpers
│  ├─ prisma.ts                # Prisma client + token-encryption extension
│  ├─ format.ts                # Date/time formatting helpers
│  └─ google/                  # Google API integration
│     ├─ scopes.ts             # Requested OAuth scopes
│     ├─ client.ts             # Per-user authenticated OAuth2 client
│     ├─ errors.ts             # Error → UI message mapping
│     ├─ types.ts              # Domain + WidgetResult types
│     ├─ calendar.ts | tasks.ts | drive.ts | photos.ts
└─ components/
   ├─ ui/                      # shadcn/ui primitives
   ├─ auth/                    # Sign-in / sign-out buttons
   └─ dashboard/               # Header + widgets
```

All Google data is fetched **server-side** (Server Components / Server Actions);
tokens never reach the browser.

## Getting started

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database
- A Google Cloud project with OAuth credentials

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Google OAuth

1. In the [Google Cloud Console](https://console.cloud.google.com/) create an
   **OAuth 2.0 Client ID** (type: *Web application*).
2. Add the authorized redirect URI:
   `http://localhost:3000/api/auth/callback/google`
3. Enable the APIs you intend to use under **APIs & Services → Library**:
   - Google Calendar API
   - Google Tasks API
   - Google Drive API
   - Photos Library API
4. Add the matching scopes on the **OAuth consent screen** (see
   `src/lib/google/scopes.ts`).

> **Note on Google Photos:** Google has restricted broad Photos Library access.
> The `photoslibrary.readonly` scope requires app verification; until then the
> Photos widget will show a graceful permission error. The Photos data is read
> via the REST API directly since `googleapis` no longer bundles it.

### 4. Environment variables

```bash
cp .env.example .env
```

Fill in the values. Generate secrets with:

```bash
openssl rand -base64 32   # for AUTH_SECRET and TOKEN_ENCRYPTION_KEY
```

| Variable               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                 |
| `AUTH_SECRET`          | Auth.js session/JWT secret                   |
| `AUTH_GOOGLE_ID`       | Google OAuth client ID                       |
| `AUTH_GOOGLE_SECRET`   | Google OAuth client secret                   |
| `TOKEN_ENCRYPTION_KEY` | 32-byte key for encrypting tokens at rest    |

### 5. Set up the database

```bash
npx prisma db push     # or: npx prisma migrate dev
```

### 6. Run

```bash
npm run dev
```

Open <http://localhost:3000> and sign in with Google.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Generate Prisma client + build       |
| `npm start`         | Start the production server          |
| `npm run lint`      | Run ESLint                           |
| `npm run typecheck` | Run the TypeScript compiler          |
| `npm run db:push`   | Push the Prisma schema to the DB     |
| `npm run db:studio` | Open Prisma Studio                   |

## Security notes

- OAuth tokens are encrypted with **AES-256-GCM** before being written to the
  database and decrypted only server-side when making API calls.
- Refreshed access tokens are persisted automatically (and re-encrypted).
- The dashboard route is auth-guarded and rendered dynamically.
