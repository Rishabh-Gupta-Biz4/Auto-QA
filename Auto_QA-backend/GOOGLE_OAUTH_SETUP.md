# Google OAuth 2.0 Setup Guide

## ✅ Implementation Complete!

Google Social Login has been successfully integrated into your Auto QA application!

---

## 📋 Table of Contents

1. [Features](#features)
2. [Setup Instructions](#setup-instructions)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [User Flow](#user-flow)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Features

✅ **One-Click Login** - Sign in with Google account  
✅ **Auto Account Creation** - New users automatically created  
✅ **Email Verification** - Google-verified emails trusted  
✅ **Profile Pictures** - Google profile photos synced  
✅ **Secure JWT Tokens** - Standard authentication flow  
✅ **Existing Account Linking** - Links Google to existing accounts  

---

## 🚀 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Click "Select a project" → "New Project"
   - Name: `Auto-QA` (or your preferred name)
   - Click "Create"

3. **Enable Google+ API:**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (for testing) or "Internal" (for organization)
   - Fill in:
     - **App name:** Auto-QA Testing Platform
     - **User support email:** your-email@example.com
     - **Developer contact:** your-email@example.com
   - Click "Save and Continue"
   - Add scopes:
     - `userinfo.email`
     - `userinfo.profile`
   - Click "Save and Continue"
   - Add test users (your email for testing)
   - Click "Save and Continue"

5. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `Auto-QA Web Client`
   - Add Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:3001
     https://yourdomain.com  (for production)
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:3001/api/v1/auth/google/callback
     https://api.yourdomain.com/api/v1/auth/google/callback  (for production)
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret!**

---

### Step 2: Update Environment Variables

#### Backend (`Auto_QA-backend/env.json`):

Add these fields to your `env.json`:

```json
{
  "PORT": "3001",
  "DB_HOST": "localhost",
  "DB_PORT": "3306",
  "DB_USER": "root",
  "DB_PASSWORD": "your_password",
  "DB_NAME": "auto_qa_db",
  "JWT_SECRET": "your_jwt_secret_key_here",
  "JWT_EXPIRES_IN": "1d",
  "JWT_REFRESH_SECRET": "your_refresh_secret_key_here",
  "JWT_REFRESH_EXPIRES_IN": "7d",
  "FRONTEND_URL": "http://localhost:3000",
  
  "GOOGLE_CLIENT_ID": "your-google-client-id-here.apps.googleusercontent.com",
  "GOOGLE_CLIENT_SECRET": "your-google-client-secret-here",
  "GOOGLE_CALLBACK_URL": "http://localhost:3001/api/v1/auth/google/callback"
}
```

#### Frontend (`Auto_QA-web/.env.local`):

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### Step 3: Update Database Schema

Run the database migration to add Google OAuth fields:

```bash
cd Auto_QA-backend
npm run dev
```

The migration will automatically add:
- `google_id` column (unique)
- `profile_picture` column
- Index on `google_id`

Or manually run:

```sql
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER email,
ADD COLUMN profile_picture VARCHAR(500) NULL AFTER google_id,
ADD INDEX idx_google_id (google_id);
```

---

### Step 4: Restart the Application

```bash
# Backend
cd Auto_QA-backend
npm run dev

# Frontend
cd Auto_QA-web
npm run dev
```

---

## ⚙️ Configuration

### Backend Configuration

**File:** `src/config/google-oauth.ts`

```typescript
export const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  scope: ['profile', 'email'],
};
```

### Frontend Configuration

The Google login button will automatically use the `NEXT_PUBLIC_API_URL` environment variable.

---

## 🧪 Testing

### 1. Check Google OAuth Status

```bash
curl http://localhost:3001/api/v1/auth/google/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "googleAuthEnabled": true,
    "callbackURL": "http://localhost:3001/api/v1/auth/google/callback"
  }
}
```

### 2. Test Google Login Flow

1. Open your frontend: `http://localhost:3000/login`
2. Click "Continue with Google" button
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard

### 3. Check User in Database

```sql
SELECT id, name, email, google_id, profile_picture, email_verified 
FROM users 
WHERE google_id IS NOT NULL;
```

---

## 👤 User Flow

### For New Users:

1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes the app
4. Backend receives user info from Google
5. **New user account created** with:
   - Name from Google
   - Email from Google (verified)
   - Random password (not used for Google login)
   - Google ID stored
   - Profile picture from Google
   - Role: `qa_engineer`
6. JWT tokens generated
7. User redirected to dashboard

### For Existing Users (Email Match):

1. User clicks "Continue with Google"
2. Backend finds existing account by email
3. **Google ID linked** to existing account
4. Profile picture updated
5. JWT tokens generated
6. User redirected to dashboard

### For Existing Google Users:

1. User clicks "Continue with Google"
2. Backend finds account by Google ID
3. Profile picture updated
4. Last login updated
5. JWT tokens generated
6. User redirected to dashboard

---

## 🔌 API Endpoints

### 1. Initiate Google OAuth

**GET** `/api/v1/auth/google`

Redirects user to Google OAuth consent screen.

**Example:**
```html
<a href="http://localhost:3001/api/v1/auth/google">
  Login with Google
</a>
```

---

### 2. Google OAuth Callback

**GET** `/api/v1/auth/google/callback`

Handles Google's response and redirects to frontend.

**Redirect URL (Success):**
```
http://localhost:3000/auth/google/callback?
  token=<access_token>&
  refreshToken=<refresh_token>&
  user=<encoded_user_data>
```

**Redirect URL (Error):**
```
http://localhost:3000/login?error=<error_code>
```

**Error Codes:**
- `auth_failed` - Google authentication failed
- `no_user` - No user information received
- `server_error` - Server error occurred

---

### 3. Check Google OAuth Status

**GET** `/api/v1/auth/google/status`

Check if Google OAuth is configured.

**Response:**
```json
{
  "success": true,
  "data": {
    "googleAuthEnabled": true,
    "callbackURL": "http://localhost:3001/api/v1/auth/google/callback"
  }
}
```

---

## 💻 Frontend Integration

### Google Login Button Component

**File:** `src/components/google-login-button.tsx`

```tsx
import GoogleLoginButton from '@/components/google-login-button';

// In your login page
<GoogleLoginButton 
  onError={(error) => console.error(error)}
  disabled={false}
/>
```

### Google OAuth Callback Page

**File:** `src/app/auth/google/callback/page.tsx`

Automatically handles the OAuth callback and:
1. Extracts tokens from URL
2. Dispatches login action to Redux
3. Redirects to dashboard

---

## 🔒 Security Considerations

### ✅ What's Secure:

1. **Google-Verified Emails** - Automatically trusted
2. **JWT Tokens** - Standard authentication
3. **Unique Google IDs** - No duplicate accounts
4. **HTTPS in Production** - Always use HTTPS
5. **Token Expiration** - Tokens expire automatically

### ⚠️ Important Notes:

1. **Always use HTTPS in production**
2. **Keep Client Secret secure** - Never commit to Git
3. **Validate redirect URIs** - Only allow trusted domains
4. **Token Storage** - Currently in localStorage (consider httpOnly cookies for production)

---

## 🛠️ Troubleshooting

### Issue 1: "Google OAuth is not configured"

**Solution:**
- Check `env.json` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Restart backend server after updating env variables

### Issue 2: "Redirect URI mismatch"

**Solution:**
- Ensure callback URL in Google Console matches exactly:
  ```
  http://localhost:3001/api/v1/auth/google/callback
  ```
- Check for trailing slashes
- Verify protocol (http vs https)

### Issue 3: "No email provided by Google"

**Solution:**
- Ensure `email` scope is requested in Google Console
- Check OAuth consent screen has `userinfo.email` scope
- User must grant email permission

### Issue 4: "Database error: google_id column doesn't exist"

**Solution:**
- Run the database migration:
  ```sql
  ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) UNIQUE NULL,
  ADD COLUMN profile_picture VARCHAR(500) NULL;
  ```

### Issue 5: "CORS error on Google callback"

**Solution:**
- Add Google domains to CORS whitelist in backend
- Ensure frontend URL is in `FRONTEND_URL` env variable

---

## 📊 Database Schema Changes

### Added Columns:

```sql
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE NULL,
ADD COLUMN profile_picture VARCHAR(500) NULL,
ADD INDEX idx_google_id (google_id);
```

### User Model Updates:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  google_id?: string;           // NEW
  profile_picture?: string;     // NEW
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}
```

---

## 🎨 UI Components

### Login Page with Google Button

The login page now includes:

1. **Standard email/password form**
2. **Divider ("or")**
3. **Google login button** with official styling
4. **Error handling**
5. **Loading states**

---

## 📝 Files Created/Modified

### Backend (8 files):

1. ✅ `src/config/google-oauth.ts` - OAuth configuration
2. ✅ `src/features/auth/google-strategy.ts` - Passport strategy
3. ✅ `src/features/auth/google-auth.controller.ts` - Controller
4. ✅ `src/features/auth/google-auth.routes.ts` - Routes
5. ✅ `src/db/migrations/006_add_google_oauth_fields.ts` - Migration
6. ✅ `src/schema/user.model.ts` - Updated model
7. ✅ `src/App.ts` - Integrated OAuth
8. ✅ `env.json` - Added Google credentials

### Frontend (4 files):

1. ✅ `src/components/google-login-button.tsx` - Login button
2. ✅ `src/components/google-login-button.module.scss` - Button styles
3. ✅ `src/app/auth/google/callback/page.tsx` - Callback handler
4. ✅ `src/app/auth/google/callback/callback.module.scss` - Callback styles
5. ✅ `src/app/login/page.tsx` - Updated with Google button
6. ✅ `.env.local` - API URL configuration

---

## 🚀 Production Deployment

### Before Going to Production:

1. **Update Redirect URIs** in Google Console:
   ```
   https://api.yourdomain.com/api/v1/auth/google/callback
   ```

2. **Update Environment Variables:**
   ```
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Enable HTTPS:**
   - Use SSL certificates
   - Force HTTPS redirect

4. **Security Headers:**
   - Already configured with Helmet.js

5. **Rate Limiting:**
   - Already configured

---

## 🎉 Success!

Your Auto QA application now supports Google Social Login! Users can:

✅ Sign in with one click  
✅ Auto-create accounts  
✅ Link existing accounts  
✅ Sync profile pictures  
✅ Skip email verification  

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** October 16, 2025  
**Version:** 1.0.0


