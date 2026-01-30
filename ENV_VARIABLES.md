# New Environment Variables

## Required Environment Variables for Documents API

Add these new environment variables to your `.env` file:

```bash
# ============================================
# Regula API Configuration
# ============================================
# Mode: 'test' for mock verification, 'real-api' for actual Regula API
REGULA_MODE=test

# Regula API Key (required only when REGULA_MODE=real-api)
# Get your API key from: https://regulaforensics.com/
REGULA_API_KEY=

# Regula API Base URL (default: https://api.regulaforensics.com)
REGULA_API_URL=https://api.regulaforensics.com

# ============================================
# Encryption & Storage Configuration
# ============================================
# Encryption key for encrypting document fields
# IMPORTANT: Change this to a secure random key in production!
# Generate a secure key: openssl rand -base64 32
ENCRYPTION_KEY=change-this-to-a-secure-random-key-in-production

# Path where encrypted document files will be stored
# Default: ./storage/documents (relative to workspace root)
DOCUMENT_STORAGE_PATH=./storage/documents

# ============================================
# JWT Secret (if not already set)
# ============================================
# Secret key for JWT token signing
# IMPORTANT: Change this to a secure random key in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Complete .env File Example

Here's what your complete `.env` file should look like:

```bash
# ============================================
# Port Configuration
# ============================================
ADMIN_PORT=3001
USER_PORT=3000
API_PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000

# ============================================
# Redis Configuration
# ============================================
REDIS_URL=redis://redis:6379

# ============================================
# PostgreSQL Configuration
# ============================================
DATABASE_URL=postgresql://allids:allidsdotone@postgres:5432/allids
POSTGRES_USER=allids
POSTGRES_PASSWORD=allidsdotone
POSTGRES_DB=allids

# ============================================
# Application Configuration
# ============================================
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# ============================================
# Regula API Configuration
# ============================================
REGULA_MODE=test
REGULA_API_KEY=
REGULA_API_URL=https://api.regulaforensics.com

# ============================================
# Encryption & Storage Configuration
# ============================================
ENCRYPTION_KEY=change-this-to-a-secure-random-key-in-production
DOCUMENT_STORAGE_PATH=./storage/documents

# ============================================
# JWT Secret
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Environment Variable Descriptions

### Regula API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REGULA_MODE` | Yes | `test` | Set to `test` for mock verification or `real-api` for actual Regula API |
| `REGULA_API_KEY` | Conditional | - | Required when `REGULA_MODE=real-api`. Get from Regula website |
| `REGULA_API_URL` | No | `https://api.regulaforensics.com` | Regula API base URL |

### Encryption & Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENCRYPTION_KEY` | Yes | - | AES encryption key for document fields. **Must be changed in production!** |
| `DOCUMENT_STORAGE_PATH` | No | `./storage/documents` | Path where encrypted document files are stored |

### JWT Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing. **Must be changed in production!** |

---

## Production Security Notes

⚠️ **IMPORTANT**: Before deploying to production:

1. **Generate secure encryption key**:
   ```bash
   openssl rand -base64 32
   ```

2. **Generate secure JWT secret**:
   ```bash
   openssl rand -base64 32
   ```

3. **Set `REGULA_MODE=real-api`** and add your actual `REGULA_API_KEY`

4. **Use absolute paths** for `DOCUMENT_STORAGE_PATH` in production

5. **Never commit** `.env` file to version control

---

## Switching to Real Regula API

When you get your Regula API key:

1. Update `.env`:
   ```bash
   REGULA_MODE=real-api
   REGULA_API_KEY=your-actual-api-key-here
   ```

2. Restart the API service:
   ```bash
   docker compose restart api
   ```

3. No code changes needed - the service automatically switches modes!

