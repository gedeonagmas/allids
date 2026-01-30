# Documents API Documentation

## Overview
The Documents API allows users with `USER` role to upload, verify, and manage their identity documents using Regula Document Reader integration.

**Base URL**: `http://localhost:4000/documents` (or your API URL)

**Authentication**: All endpoints require JWT authentication via:
- Cookie: `access_token`
- Header: `Authorization: Bearer <token>`

**Required Role**: `USER` (only users with USER role can access these endpoints)

---

## Endpoints

### 1. Upload Document (Multipart Form Data)

**Endpoint**: `POST /documents/upload`

**Content-Type**: `multipart/form-data`

**Request**:
- **Form Field**: `image` (file) - JPEG, PNG, or WebP image (max 10MB)
- **Form Field**: `type` (string) - Document type: `PASSPORT`, `NATIONAL_ID`, or `DRIVER_LICENSE`

**Example using cURL**:
```bash
curl -X POST http://localhost:4000/documents/upload \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "image=@/path/to/document.jpg" \
  -F "type=PASSPORT"
```

**Example using JavaScript/Fetch**:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('type', 'PASSPORT');

const response = await fetch('http://localhost:4000/documents/upload', {
  method: 'POST',
  headers: {
    'Cookie': 'access_token=YOUR_JWT_TOKEN'
  },
  body: formData
});
```

**Response** (201 Created):
```json
{
  "id": "uuid-string",
  "type": "PASSPORT",
  "status": "VERIFIED",
  "issuerCountry": "USA",
  "expiredDate": "2030-12-31T00:00:00.000Z",
  "verificationStatus": "success",
  "fieldsExtracted": 8,
  "createdAt": "2026-01-30T03:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid document type, image format, or size
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have USER role
- `500 Internal Server Error`: Server error during verification

---

### 2. Upload Document (Base64 JSON)

**Endpoint**: `POST /documents/upload-base64`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "type": "PASSPORT",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Field Descriptions**:
- `type` (string, required): Document type - `PASSPORT`, `NATIONAL_ID`, or `DRIVER_LICENSE`
- `image` (string, required): Base64 encoded image with data URL prefix (`data:image/jpeg;base64,` or `data:image/png;base64,`)

**Example using cURL**:
```bash
curl -X POST http://localhost:4000/documents/upload-base64 \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "type": "NATIONAL_ID",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

**Example using JavaScript/Fetch**:
```javascript
const response = await fetch('http://localhost:4000/documents/upload-base64', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'access_token=YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    type: 'DRIVER_LICENSE',
    image: base64ImageString // Should include data URL prefix
  })
});
```

**Response** (201 Created):
```json
{
  "id": "uuid-string",
  "type": "NATIONAL_ID",
  "status": "VERIFIED",
  "issuerCountry": "USA",
  "expiredDate": "2028-06-30T00:00:00.000Z",
  "verificationStatus": "success",
  "fieldsExtracted": 7,
  "createdAt": "2026-01-30T03:00:00.000Z"
}
```

**Error Responses**: Same as endpoint #1

---

### 3. Get User's Documents

**Endpoint**: `GET /documents`

**Description**: Retrieves all documents belonging to the authenticated user

**Request**: No body required

**Example using cURL**:
```bash
curl -X GET http://localhost:4000/documents \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Example using JavaScript/Fetch**:
```javascript
const response = await fetch('http://localhost:4000/documents', {
  method: 'GET',
  headers: {
    'Cookie': 'access_token=YOUR_JWT_TOKEN'
  }
});
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid-string-1",
    "type": "PASSPORT",
    "status": "VERIFIED",
    "issuerCountry": "USA",
    "expiredDate": "2030-12-31T00:00:00.000Z",
    "createdAt": "2026-01-30T03:00:00.000Z",
    "updatedAt": "2026-01-30T03:00:00.000Z",
    "fieldsCount": 8
  },
  {
    "id": "uuid-string-2",
    "type": "NATIONAL_ID",
    "status": "REJECTED",
    "issuerCountry": null,
    "expiredDate": null,
    "createdAt": "2026-01-29T10:00:00.000Z",
    "updatedAt": "2026-01-29T10:00:00.000Z",
    "fieldsCount": 0
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have USER role

---

### 4. Get Specific Document

**Endpoint**: `GET /documents/:id`

**Description**: Retrieves a specific document by ID (only if it belongs to the authenticated user)

**URL Parameters**:
- `id` (string, required): Document UUID

**Example using cURL**:
```bash
curl -X GET http://localhost:4000/documents/uuid-string \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Example using JavaScript/Fetch**:
```javascript
const documentId = 'uuid-string';
const response = await fetch(`http://localhost:4000/documents/${documentId}`, {
  method: 'GET',
  headers: {
    'Cookie': 'access_token=YOUR_JWT_TOKEN'
  }
});
```

**Response** (200 OK):
```json
{
  "id": "uuid-string",
  "type": "PASSPORT",
  "status": "VERIFIED",
  "issuerCountry": "USA",
  "expiredDate": "2030-12-31T00:00:00.000Z",
  "createdAt": "2026-01-30T03:00:00.000Z",
  "updatedAt": "2026-01-30T03:00:00.000Z",
  "fieldsCount": 8
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have USER role
- `404 Not Found`: Document not found or doesn't belong to user

---

## Document Types

The following document types are supported:

- `PASSPORT` - International passport
- `NATIONAL_ID` - National identity card
- `DRIVER_LICENSE` - Driver's license

---

## Document Status

Documents can have the following statuses:

- `VERIFIED` - Document verified successfully by Regula
- `REJECTED` - Document verification failed
- `PENDING` - Document verification in progress (default)

---

## Response Fields

### Document Object
- `id` (string): Unique document identifier (UUID)
- `type` (string): Document type (`PASSPORT`, `NATIONAL_ID`, `DRIVER_LICENSE`)
- `status` (string): Verification status (`VERIFIED`, `REJECTED`, `PENDING`)
- `issuerCountry` (string|null): Country that issued the document
- `expiredDate` (string|null): Document expiration date (ISO 8601)
- `createdAt` (string): Document creation timestamp (ISO 8601)
- `updatedAt` (string): Document last update timestamp (ISO 8601)
- `fieldsCount` (number): Number of extracted fields stored

### Upload Response Additional Fields
- `verificationStatus` (string): `success` or `failure`
- `fieldsExtracted` (number): Number of fields extracted from the document

---

## Notes

1. **File Size Limit**: Maximum 10MB per image
2. **Supported Formats**: JPEG, PNG, WebP
3. **Base64 Format**: When using `/upload-base64`, include the data URL prefix: `data:image/jpeg;base64,` or `data:image/png;base64,`
4. **Field Extraction**: Fields are only extracted and stored when verification status is `success`
5. **Encryption**: All extracted field values are encrypted before storage
6. **Storage**: Document images are encrypted and stored on disk

---

## Regula Integration

The API integrates with Regula Document Reader for document verification:

- **Test Mode** (`REGULA_MODE=test`): Uses mock verification with realistic field extraction
- **Real API Mode** (`REGULA_MODE=real-api`): Uses actual Regula API (requires `REGULA_API_KEY`)

When verification succeeds, the following fields are typically extracted:
- `firstName`, `lastName`, `middleName`
- `documentNumber`
- `dateOfBirth`, `dateOfExpiry`
- `nationality`
- `sex`
- `address` (for ID and Driver License)
- `personalNumber` (for Passport)
- `licenseNumber`, `licenseClass` (for Driver License)

All extracted fields are encrypted and stored in the `document_fields` table.

