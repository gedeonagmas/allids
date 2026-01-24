# Authentication Implementation

## Overview
Complete authentication system with:
- **Users**: OTP-based authentication (phone number)
- **Admin/Org**: Username + Password authentication
- **JWT tokens** stored in http-only cookies
- **Role-based access control** (USER, ADMIN, ORG)

## Database Schema
All models have been created in Prisma schema:
- `User` - Users with phone/username, role, status
- `Otp` - OTP codes for phone verification
- `Organization` - Organizations with API keys and credentials
- `Document`, `DocumentField` - Document management
- `AccessRequest`, `PermissionGrant` - Access control
- `AccessLink` - One-time access tokens
- `AuditLog` - Audit trail

## Authentication Endpoints

### 1. Request OTP (User Registration/Login)
```http
POST /auth/request-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully. Please verify to continue.",
  "isNewUser": true,
  "otp": "123456"
}
```

**Note:** The `otp` field contains the 6-digit OTP code. In production, this should be removed and only sent via SMS.

**Note:** 
- This endpoint automatically handles both registration and login
- If user doesn't exist, it creates a new user with UNVERIFIED status
- If user exists, it sends OTP for login
- If user account is frozen, it returns an error
- OTP is sent automatically (no need to call send-otp separately)

### 2. Verify OTP (Complete Registration/Login)
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "+1234567890",
    "role": "USER",
    "status": "VERIFIED"
  },
  "message": "OTP verified successfully"
}
```

**Note:** JWT token is automatically set as http-only cookie `access_token`

### 3. Register Organization
```http
POST /auth/register-org
Content-Type: application/json

{
  "name": "Dashen Bank",
  "address": "Addis Ababa, Ethiopia",
  "organizationType": "BANK",
  "contactEmail": "contact@dashenbank.com",
  "username": "dashenbank",
  "password": "securepassword123",
  "allowedDocumentTypes": ["PASSPORT", "NATIONAL_ID"]
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Dashen Bank",
    "username": "dashenbank",
    "organizationType": "BANK",
    "role": "ORG"
  },
  "message": "Organization registered successfully"
}
```

**Note:** JWT token is automatically set as http-only cookie `access_token`

### 4. Register Admin
```http
POST /auth/register-admin
Content-Type: application/json

{
  "username": "admin",
  "password": "adminpassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "ADMIN"
  },
  "message": "Admin registered successfully"
}
```

**Note:** Phone field has been removed from admin registration.

**Note:** JWT token is automatically set as http-only cookie `access_token`

### 5. Login (Admin/Org)
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin_username",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Organization Name" // or username for admin
    "role": "ORG" // or "ADMIN"
  },
  "message": "Login successful"
}
```

**Note:** JWT token is automatically set as http-only cookie `access_token`

### 7. Get Current User
```http
GET /auth/me
Cookie: access_token=<jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "phone": "+1234567890",
  "role": "USER",
  "status": "VERIFIED",
  "type": "user"
}
```

### 8. Logout
```http
POST /auth/logout
Cookie: access_token=<jwt_token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

## Using Guards in Controllers

### Protect Routes with JWT
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
```

### Role-Based Access Control
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  @Get('dashboard')
  getDashboard() {
    return { message: 'Admin dashboard' };
  }
}
```

## Environment Variables

Add to your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Next Steps

1. **Run Migration:**
   ```bash
   cd api
   npx prisma migrate dev --name init_auth
   ```

2. **Create Admin User:**
   ```typescript
   // You can create a script or use Prisma Studio
   const admin = await prisma.user.create({
     data: {
       username: 'admin',
       passwordHash: await bcrypt.hash('admin123', 10),
       role: 'ADMIN',
       status: 'VERIFIED',
     },
   });
   ```

3. **Create Organization:**
   ```typescript
   const org = await prisma.organization.create({
     data: {
       name: 'Test Bank',
       username: 'testbank',
       passwordHash: await bcrypt.hash('password123', 10),
       organizationType: 'BANK',
       apiKeyHash: await bcrypt.hash('api-key-123', 10),
       allowedDocumentTypes: ['PASSPORT', 'NATIONAL_ID'],
     },
   });
   ```

## Security Features

✅ Http-only cookies (prevents XSS)
✅ Secure flag in production
✅ SameSite strict (prevents CSRF)
✅ Password hashing with bcrypt
✅ OTP hashing with bcrypt
✅ JWT expiration (7 days)
✅ Role-based access control
✅ Input validation with class-validator

## Testing

### Test User Authentication Flow:
1. Request OTP: `POST /auth/request-otp` with phone (handles both registration and login)
2. Check console for OTP code (in development)
3. Verify OTP: `POST /auth/verify-otp` with phone and code
4. Get profile: `GET /auth/me` (cookie automatically sent)

### Test Admin/Org Login:
1. Login: `POST /auth/login` with username/password
2. Get profile: `GET /auth/me` (cookie automatically sent)

