#!/bin/sh

set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile
fi

PRISMA_CLIENT="./node_modules/.prisma/client"
if [ ! -d "$PRISMA_CLIENT" ]; then
  echo "Generating Prisma client..."
  pnpm --filter api run prisma:generate || true
fi

exec "$@"
