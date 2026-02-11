#!/bin/sh
set -e

# Increase memory limit for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# 1️⃣ Generate Prisma client
echo "Generating Prisma client..."
pnpm --filter api run prisma:generate || true

# 2️⃣ Apply Prisma migrations
if [ ! -z "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  pnpm --filter api run prisma:migrate:deploy || true
fi

# 3️⃣ Create storage directory
STORAGE_PATH=${DOCUMENT_STORAGE_PATH:-./api/storage/documents}
if [ ! -d "$STORAGE_PATH" ]; then
  echo "Creating storage directory: $STORAGE_PATH"
  mkdir -p "$STORAGE_PATH"
fi

# 4️⃣ Execute the main command
exec "$@"
