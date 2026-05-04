# Life & Work OS

Premium personal “Life & Work OS” web app for managing finance, health, study, time, relationships, emotions, spiritual self-reflection, personal strategy, and energy accumulation.

The product UI is Vietnamese-first. Code, folders, variables, and technical comments are English.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Supabase Postgres + Auth
- `@supabase/supabase-js`
- `@supabase/ssr`
- Zod
- React Hook Form
- date-fns
- lucide-react
- Framer Motion
- pnpm
- Vercel-ready

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create local environment file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. In Supabase Dashboard, enable Email/Password Auth.
3. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the publishable anon key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Apply the migration in `supabase/migrations/20260503143000_initial_life_work_os.sql`.

With Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

For local Supabase:

```bash
supabase start
supabase db reset
```

`supabase db reset` applies migrations and `supabase/seed.sql`.

Demo local account from seed:

```text
Email: demo@lifeos.local
Password: lifeos-demo-123
```

## Database

The migration creates:

- `profiles`
- `tasks`
- `recurring_task_templates`
- `daily_priorities`
- `finance_entries`
- `health_logs`
- `study_sessions`
- `time_logs`
- `relationship_logs`
- `emotion_logs`
- `spiritual_profiles`
- `strategy_profiles`
- `energy_activity_types`
- `energy_activity_logs`

Every user-owned table has:

- UUID primary key
- `user_id` referencing `auth.users`
- `created_at`
- `updated_at`
- Row Level Security enabled
- policies that restrict select/insert/update/delete to `auth.uid() = user_id`

## Supabase SSR Auth

This repo uses the current SSR pattern:

- `lib/supabase/client.ts` for browser client
- `lib/supabase/server.ts` for server client with cookies
- `lib/supabase/proxy.ts` and root `proxy.ts` for session refresh
- `supabase.auth.getClaims()` for server-side protected route checks

It does not use deprecated `@supabase/auth-helpers-*` packages.

## Environment Variables

Public browser-visible variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No service-role key is required for the app. Do not expose service-role secrets to the browser.

When environment variables change on Vercel, trigger a new deployment. Existing deployments do not automatically pick up changed environment variables.

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Set Framework Preset to Next.js.
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Deploy.
6. After changing env vars, redeploy the project.

Build command:

```bash
pnpm build
```

Install command:

```bash
pnpm install
```

## Quality Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Product Notes

The spiritual reflection module is explicitly labeled as `mang tính tham khảo / tự quan sát bản thân`. It is for self-reflection and inspiration only, not scientific claims.

The energy module is first-class. It includes reusable energy activity types, daily completion checkboxes, duration, notes, filtering by source category, and dashboard score contribution.

Default energy activities:

- Hát to để giải tỏa cảm xúc
- Tập đi tập lại những động tác cầu đơn giản
- Flow đọc truyện và nhập vai nhân vật giả tưởng
- Coding với nhạc nền êm ái
- Game tập trung luyện tối đa kỹ năng một tướng
- Học hỏi kiến thức thực dụng

## Troubleshooting

If auth never persists:

- Check that `proxy.ts` exists at repo root.
- Check Supabase URL/key values.
- Clear browser cookies and sign in again.

If protected pages redirect to sign-in:

- Confirm Email/Password Auth is enabled.
- Confirm the user has a valid session.
- Confirm env vars are present in the running environment.

If CRUD fails with RLS errors:

- Confirm migrations were applied.
- Confirm the user is authenticated.
- Confirm rows are inserted with `user_id = auth.uid()`.

If Vercel build works but runtime auth fails:

- Recheck Vercel environment variables.
- Redeploy after env changes.
- Verify Supabase Auth site URL and redirect URLs include the deployed domain.

If local seed account does not sign in:

- Use Supabase local with `supabase db reset`.
- Confirm `supabase/seed.sql` ran successfully.
- If using a cloud project, create a normal user through the app instead of relying on the local seed account.
