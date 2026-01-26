#!/bin/sh
set -e

# 1️⃣ Install dependencies if missing
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile
fi

# 2️⃣ Generate Prisma client if missing
PRISMA_CLIENT="./node_modules/.prisma/client"
if [ ! -d "$PRISMA_CLIENT" ]; then
  echo "Generating Prisma client..."
  pnpm --filter api run prisma:generate || true
fi

# 3️⃣ Apply Prisma migrations (if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  pnpm --filter api run prisma:migrate:deploy || true
else
  echo "Warning: DATABASE_URL not set, skipping migrations"
fi

# 4️⃣ Execute the main command
exec "$@"
