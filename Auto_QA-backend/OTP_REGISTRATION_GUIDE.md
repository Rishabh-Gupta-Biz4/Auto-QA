# OTP Registration Flow Guide

This guide explains the new OTP (One-Time Password) verification system for user registration in the Auto QA backend.

## Overview

The registration process now requires OTP verification to ensure email ownership and prevent spam registrations. The flow consists of two steps:

1. **Request OTP**: User provides email to receive an OTP
2. **Verify OTP & Register**: User provides registration details + OTP to complete registration

## API Endpoints

### 1. Register User (Backward Compatible)

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securePassword123!",
  "role": "qa_engineer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully. Please verify your email to complete registration.",
  "data": {
    "email": "user@example.com",
    "expiresIn": 10,
    "maxAttempts": 3,
    "nextStep": "Use /verify-otp-register endpoint with the OTP to complete registration"
  }
}
```

**Note:** This endpoint maintains backward compatibility but now requires OTP verification to complete registration.

### 2. Request Registration OTP (Alternative)

**Endpoint:** `POST /api/v1/auth/request-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresIn": 10,
    "maxAttempts": 3
  }
}
```

**Features:**
- Generates a 6-digit OTP
- OTP expires in 10 minutes
- Maximum 3 verification attempts
- Prevents duplicate registrations
- OTP is logged to console for development

### 3. Verify OTP and Complete Registration

**Endpoint:** `POST /api/v1/auth/verify-otp-register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securePassword123!",
  "role": "qa_engineer",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "qa_engineer"
    },
    "token": "jwt_token_here"
  }
}
```

## Database Schema

### Registration OTPs Table

```sql
CREATE TABLE registration_otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);
```

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Attempt Limiting**: Maximum 3 verification attempts per OTP
3. **Rate Limiting**: Endpoints are protected by rate limiting middleware
4. **Input Validation**: All inputs are validated using Joi schemas
5. **Automatic Cleanup**: Expired OTPs are automatically cleaned up

## Development Testing

### Using the Test Script

1. Start the server:
   ```bash
   npm start
   ```

2. Run the test script:
   ```bash
   node test-otp-flow.js
   ```

3. Check the server console for the OTP code

4. Update the OTP in the test script and run again

### Manual Testing with curl

**Option 1: Backward Compatible Flow**
1. Register (generates OTP):
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123!",
       "role": "qa_engineer"
     }'
   ```

2. Check server console for OTP

3. Complete registration:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/verify-otp-register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123!",
       "role": "qa_engineer",
       "otp": "123456"
     }'
   ```

**Option 2: New OTP Flow**
1. Request OTP:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. Check server console for OTP

3. Complete registration (same as above)

## Error Handling

### Common Error Responses

1. **User Already Exists** (409):
   ```json
   {
     "success": false,
     "message": "User already exists"
   }
   ```

2. **Invalid/Expired OTP** (400):
   ```json
   {
     "success": false,
     "message": "Invalid or expired OTP"
   }
   ```

3. **Rate Limited** (429):
   ```json
   {
     "success": false,
     "message": "Too many requests"
   }
   ```

## Configuration

### OTP Settings (in `src/services/otp.service.ts`)

- **OTP Length**: 6 digits
- **Expiry Time**: 10 minutes
- **Max Attempts**: 3 attempts per OTP

### Environment Variables

No additional environment variables are required. The OTP system uses the existing database connection.

## Migration

The OTP system requires a new database table. Run the migration:

```bash
# The migration will be automatically run when the server starts
npm start
```

Or manually run the migration:

```bash
npx ts-node src/db/migrations/create-registration-otp-table.ts
```

## Production Considerations

1. **Email Service**: Replace console logging with actual email service
2. **OTP Storage**: Consider using Redis for better performance
3. **Monitoring**: Add logging and monitoring for OTP generation/verification
4. **Rate Limiting**: Adjust rate limits based on expected traffic
5. **Cleanup**: Set up automated cleanup of expired OTPs

## Files Modified

- `src/services/otp.service.ts` - OTP service implementation
- `src/features/auth/auth.controller.ts` - Updated controller methods
- `src/features/auth/auth.routes.ts` - New OTP endpoints
- `src/schema/validation.ts` - New validation schemas
- `src/schema/index.ts` - Added OTP table schema
- `src/db/migrations/create-registration-otp-table.ts` - Database migration
