# Wedding Planner MVP

A wedding planning app with a React frontend deployed on Netlify and Supabase (PostgreSQL) as the database. Built with Vite, React, TypeScript, Tailwind CSS, and Netlify Functions. **Responsive for mobile** – the UI adapts to phones, tablets, and desktops with touch-friendly controls and mobile-optimized layouts.

## Tech Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, react-router-dom, Zustand
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify

## Prerequisites

- Node.js 18+
- A Supabase account
- A Netlify account
- Netlify CLI (optional, for local development): `npm install -g netlify-cli`

## Project Structure

```
wedding_planner/
├── netlify.toml           # Netlify config
├── package.json
├── supabase/
│   └── migrations/        # SQL migrations
├── src/                   # Vite React app
│   ├── api/               # Typed API client
│   ├── components/        # UI components
│   ├── pages/             # Route pages
│   ├── store/             # Zustand stores
│   └── ...
├── netlify/
│   └── functions/         # Serverless functions
│       ├── _lib/          # Shared utilities (supabase, auth)
│       ├── vendors.ts
│       ├── tasks.ts
│       ├── activities.ts
│       └── notes.ts
└── index.html
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or use an existing one)
3. Wait for the project to finish provisioning

### 2. Run the Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste into the SQL Editor and run it to create all 4 tables: `vendors`, `tasks`, `activities`, `notes`

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

### 3. Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** → `SUPABASE_URL`
3. Copy the **service_role** key (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`

**Important:** The service role key bypasses Row Level Security (RLS) and has full database access. Never expose it in client-side code. It is only used by Netlify Functions (server-side).

## Environment Variables

### Local Development

Create `.env` in the project root:

```env
# Frontend - used by Vite (exposed to client)
VITE_ADMIN_TOKEN=your-secret-token

# Couple names (optional) - task assignees; defaults: Bride, Groom
VITE_BRIDE_NAME=
VITE_GROOM_NAME=

# Backend - used by Netlify Functions
ADMIN_TOKEN=your-secret-token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Netlify (Production)

In Netlify: Site settings → Environment variables, add:

- `VITE_ADMIN_TOKEN`
- `ADMIN_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_APP_PASSWORD` (optional) – if set, visitors must enter this password to view the app
- `VITE_BRIDE_NAME` (optional) – bride’s name for task assignees (default: Bride)
- `VITE_GROOM_NAME` (optional) – groom’s name for task assignees (default: Groom)

## Local Development

### Option 1: Netlify Dev (recommended – runs frontend + functions)

```bash
npm install
netlify dev
```

Opens at `http://localhost:8888` with both the Vite app and Netlify Functions.

### Option 2: Vite only (API calls will fail without functions)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Functions must be running separately (e.g. via `netlify dev` on another port) or API requests will fail.

## Build and Deploy

### Deploy to Netlify

1. Connect your Git repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. Add all environment variables in Netlify
4. Deploy

### Manual deploy with Netlify CLI

```bash
npm run build
netlify deploy --prod
```

## Pages

All pages are responsive and work well on mobile devices (hamburger navigation, card layouts, and touch-optimized forms).

- **Dashboard**: Summary cards, due-soon list, overdue list, quick-add buttons
- **Activities**: CRUD table for events and activities
- **Tasks**: Kanban (todo/doing/done) + list view
- **Vendors**: CRUD table + vendor profile drawer
- **Notes**: Decision log with pinned notes

## Security

- **Site password**: Set `VITE_APP_PASSWORD` in Netlify env vars to require a password before viewing the app. Leave empty to disable. This is a client-side gate (casual lock, not cryptographically secure).
- All Netlify Functions require the `x-admin-token` header matching `ADMIN_TOKEN`
- The frontend sends `VITE_ADMIN_TOKEN` in requests
- Keep both tokens secret and use the same value for `ADMIN_TOKEN` and `VITE_ADMIN_TOKEN`
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret – it grants full database access and is only used server-side in Netlify Functions
