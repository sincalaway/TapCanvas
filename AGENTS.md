# Repository Guidelines

## Project Structure & Module Organization
- Monorepo (suggested): `apps/`, `packages/`, `infra/`, `artifacts/`.
- Apps: `apps/web` (React-Flow canvas + Remotion Player), `apps/compose` (render/export).
- Infra: `infra/activepieces` (flows, custom pieces, docker compose).
- Packages: `packages/schemas` (zod), `packages/sdk` (shared types/client), `packages/pieces` (Activepieces pieces).

## Build, Test, and Development Commands
- Install workspace deps: `pnpm -w install`
- Dev web app: `pnpm --filter apps/web dev`
- Build all packages: `pnpm -w build`
- Run unit tests: `pnpm -w test`
- Start Activepieces locally: `cd infra/activepieces && docker compose up -d`
- Import example flows: `infra/activepieces/flows/*.json`

## Coding Style & Naming Conventions
- Language: TypeScript (strict). UI: React.
- Lint/format: ESLint + Prettier; run `pnpm -w lint` and `pnpm -w format`.
- Filenames: kebab-case (`compose-worker.ts`); React components: PascalCase (`CanvasPanel.tsx`).
- Functions/vars: camelCase; Types/Zod schemas: PascalCase; schema files end with `.schema.ts`.
- Keep modules small; colocate tests and component styles.

## Testing Guidelines
- Framework: Vitest or Jest (project may choose one; prefer Vitest in new code).
- Test names: `*.test.ts` / `*.test.tsx`, colocated with source.
- Coverage target: 80% lines/branches for packages and critical app code.
- Run: `pnpm -w test` or `pnpm --filter {pkg} test`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, etc.
- Scope by package/app when possible: `feat(web): timeline snapping`.
- PRs must include: summary, linked issues, test plan (commands/screens), and updated docs when applicable.
- Keep PRs focused; note any infra/migration steps.

## Security & Configuration Tips
- Never commit secrets. Use environment files: `apps/web/.env.local`, service `.env` files, or Docker secrets.
- Webhooks/callbacks must validate `X-Signature` (HMAC-SHA256) and honor `X-Idempotency-Key`.
- Multi-tenant calls include `X-Tenant-Id`. Persist assets/metadata to S3/OSS per README.

## Architecture Overview (Quick)
- Zero-GPU: generate media via third‑party AI APIs; orchestrate via Activepieces; preview/export via Remotion; assets to S3/OSS.
