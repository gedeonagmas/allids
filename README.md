# allids workspace

1. install dependencies and copy `.env`:
   ```bash
   pnpm install
   cp env.example .env
   ```
2. start the stack (Redis, Postgres, admin, user, api):
   ```bash
   docker-compose up
   ```
3. visit each service:
   - admin → `http://localhost:3001`
   - user → `http://localhost:3000`
   - api → `http://localhost:4000`

## stop/run helpers

- stop everything: `docker-compose down`
- destroy Postgres data: `docker-compose down -v postgres-data`
- optional helper: `pnpm dev:down` runs the same Compose command if you prefer a pnpm alias

## Prisma & Postgres

- generate the client: `pnpm --filter api prisma generate`
- run migrations (creates the `User` table defined in `api/prisma/schema.prisma`): `pnpm --filter api prisma migrate dev`

When running services individually (outside Docker), stop Compose first and point `REDIS_URL`/`DATABASE_URL` at your local instances.

## Frontend experience
- `admin` and `user` both use TanStack Query to communicate with `api/users`.
- UI elements are built with simple Shadcn-inspired cards, badges, and buttons so the two apps look consistent.
