#!/bin/sh
set -e

# 1️⃣ Install dependencies if missing or if package.json changed
if [ ! -d node_modules ] || [ package.json -nt node_modules/.pnpm-lock.yaml ]; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile || pnpm install
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

# 4️⃣ Create storage directory for documents if it doesn't exist
STORAGE_PATH=${DOCUMENT_STORAGE_PATH:-./storage/documents}
if [ ! -d "$STORAGE_PATH" ]; then
  echo "Creating storage directory: $STORAGE_PATH"
  mkdir -p "$STORAGE_PATH"
fi

# 5️⃣ Execute the main command
exec "$@"
