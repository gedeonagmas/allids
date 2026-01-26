# Profile Management API

This document describes the profile management functionality that allows users to update their own profiles and admins to update any user's profile.

## Endpoints

### User Profile Management

#### Get Own Profile
- **Endpoint**: `GET /users/profile`
- **Authentication**: Required (JWT)
- **Description**: Get the current authenticated user's profile
- **Response**: User object with id, phone, username, status, role, createdAt, updatedAt

#### Update Own Profile
- **Endpoint**: `PATCH /users/profile`
- **Authentication**: Required (JWT)
- **Description**: Update the current authenticated user's profile
- **Request Body**:
  ```json
  {
    "username": "newusername",  // Optional, 3-50 characters
    "phone": "+1234567890"       // Optional, valid phone number format
  }
  ```
- **Response**: Updated user object
- **Validation**:
  - Username must be unique (if provided)
  - Phone must be unique (if provided)
  - Username must be 3-50 characters
  - Phone must match valid phone number format

### Admin Profile Management

#### Update Any User Profile
- **Endpoint**: `PATCH /users/:id`
- **Authentication**: Required (JWT)
- **Authorization**: Admin only
- **Description**: Admin can update any user's profile
- **Request Body**:
  ```json
  {
    "username": "newusername",  // Optional
    "phone": "+1234567890"       // Optional
  }
  ```
- **Response**: Updated user object
- **Validation**:
  - Admin role required
  - Username must be unique (if provided)
  - Phone must be unique (if provided)

## Usage Examples

### User Updates Own Profile

```bash
# 1. Authenticate and get cookie
curl -c cookies.txt -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","code":"123456"}'

# 2. Get own profile
curl -b cookies.txt http://localhost:4000/users/profile

# 3. Update own profile
curl -b cookies.txt -X PATCH http://localhost:4000/users/profile \
  -H "Content-Type: application/json" \
  -d '{"username":"myusername"}'
```

### Admin Updates User Profile

```bash
# 1. Login as admin
curl -c admin_cookies.txt -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'

# 2. Update any user's profile
curl -b admin_cookies.txt -X PATCH http://localhost:4000/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"username":"updatedbyadmin","phone":"+9876543210"}'
```

## Error Responses

### 400 Bad Request
- Username already taken
- Phone number already taken
- Invalid phone number format
- Invalid username length

### 401 Unauthorized
- Missing or invalid JWT token
- Not authenticated

### 403 Forbidden
- Admin-only endpoint accessed by non-admin user

### 404 Not Found
- User not found (when admin tries to update non-existent user)

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token in http-only cookie
2. **Role-Based Access Control**: Admin endpoints are protected by `RolesGuard`
3. **User Isolation**: Users can only update their own profile via `/users/profile`
4. **Admin Override**: Admins can update any user via `/users/:id`
5. **Validation**: All inputs are validated using class-validator decorators
6. **Uniqueness Checks**: Username and phone uniqueness are enforced

## Implementation Details

- **Service Layer**: `UsersService` contains `updateProfile()` for users and `updateUserProfile()` for admins
- **DTO**: `UpdateProfileDto` validates username and phone inputs
- **Guards**: `JwtAuthGuard` ensures authentication, `RolesGuard` ensures admin access
- **Decorator**: `@CurrentUser()` extracts the authenticated user from the request

