# Life & Work OS Pro Architecture

## Runtime

- Next.js App Router owns routing, layouts, server actions, and API routes.
- `features/*` owns product modules and domain workflows.
- `components/ui` and `components/shared` own reusable interface primitives.
- `lib/supabase/*` owns Supabase browser/server/admin clients.
- `supabase/migrations/*` is the source of truth for schema and RLS.

## Giup Cy Access Model

- `giup_cy_members` is the database-driven source of truth for owner, manager, and viewer access.
- `giup_cy_audit_logs` records management actions such as exam publish, settings changes, answer updates, imports, and deletes.
- App constants in `lib/auth/access.ts` are fallback defaults for local/dev or an unapplied migration, not the long-term permission system.
- Public `/giup-cy` is read-only. Exam management belongs in authenticated `/app/giup-cy`.

## Data And Assets

- `giup_cy_exams`, `giup_cy_exam_questions`, and `giup_cy_exam_attempts` remain the core exam tables.
- `giup_cy_exam_assets` maps exams/questions to Supabase Storage paths. Existing `public/exam-assets` files can be migrated gradually.
- Recommended bucket: `giup-cy-assets`.
- Keep public exam assets readable only when the related exam is active.

## Quality Gates

- Local: `pnpm lint`, `pnpm typecheck`, `pnpm build`.
- Unit: grading and answer normalization.
- E2E: public exam list, start exam, answer, submit, results, authenticated admin list.
- CI should run the same checks before deployment.

## Pro Roadmap Hooks

- Subscription state lives in `user_subscription_plans`.
- Analytics should aggregate from `giup_cy_exam_attempts` and `graded_details`.
- Exports should render from server-side result data, not browser-only local state.
- Backup/restore should use Supabase migrations plus scheduled database backups.
- Monitoring should include Supabase advisors, build checks, and runtime error reporting.
