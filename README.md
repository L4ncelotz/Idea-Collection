# 💡 Idea Vault

> **Think it. Save it. Build it later.**

พื้นที่ส่วนตัวสำหรับเก็บไอเดียโปรเจกต์ — Title + Description + README (Markdown) + Status (`Idea` / `Building` / `Done`) — เข้าถึงได้จากทุกอุปกรณ์ด้วยบัญชี Google

Product spec: [`README (1).md`](./README%20(1).md) · Design doc: [`docs/superpowers/specs/2026-10-30-idea-vault-design.md`](./docs/superpowers/specs/2026-10-30-idea-vault-design.md)

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **Supabase** — Postgres + Row Level Security + Google OAuth
- **Tailwind CSS v4** + **shadcn/ui** (Radix, Nova preset), CodeMirror (Markdown editor), react-markdown
- **Vitest** (unit) + **Playwright** (E2E)
- Deploy: **Vercel** + Supabase free tier

## Quickstart

```bash
# 1. install
npm install

# 2. configure (needs your Supabase project + Google OAuth — see docs/SETUP.md)
cp .env.local.example .env.local
# → paste NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. run
npm run dev          # http://localhost:3000 → sign in with Google
```

> Full setup (Supabase project, schema.sql, Google OAuth credentials, deploy): **[docs/SETUP.md](./docs/SETUP.md)**

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright E2E (first run = human-assisted Google login once) |

## Structure

```
app/                  Idea List · Login · Idea Detail/Edit · OAuth callback
components/           Cards, dialogs, Markdown editor (shadcn/ui primitives)
lib/                  Types, search, validation, time, Supabase clients, data access
proxy.ts              Next.js 16 proxy — session refresh + auth gate
supabase/schema.sql   ideas table + RLS policy + index
supabase/seed.sql     Dev-only starter ideas
tests/unit · tests/e2e
```

## Security model

- Every row carries `user_id`; **RLS** enforces `auth.uid() = user_id` at the database for all operations.
- The browser talks to Supabase directly with the public **anon key** — never a database password or connection string.
- Pages are gated by `proxy.ts`; the database is the final authority.
