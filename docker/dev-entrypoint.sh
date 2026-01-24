#!/bin/sh

set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile
fi

echo "Generating Prisma client..."
cd /workspace/api && pnpm prisma generate || true

echo "Running Prisma migrations..."
pnpm --filter api run prisma:migrate:deploy || true

exec "$@"
