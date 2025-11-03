# Google OAuth - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Google Credentials (3 minutes)

1. **Go to:** https://console.cloud.google.com/
2. **Create Project:** Name it "Auto-QA"
3. **Enable API:** Search "Google+ API" → Enable
4. **OAuth Consent:**
   - External → Fill app name → Add your email
   - Scopes: Add `userinfo.email` and `userinfo.profile`
5. **Create Credentials:**
   - OAuth client ID → Web application
   - **Redirect URI:** `http://localhost:3001/api/v1/auth/google/callback`
   - **Copy:** Client ID and Client Secret

### Step 2: Update Backend Config (1 minute)

**File:** `Auto_QA-backend/env.json`

```json
{
  "GOOGLE_CLIENT_ID": "paste-your-client-id-here.apps.googleusercontent.com",
  "GOOGLE_CLIENT_SECRET": "paste-your-secret-here",
  "GOOGLE_CALLBACK_URL": "http://localhost:3001/api/v1/auth/google/callback",
  "FRONTEND_URL": "http://localhost:3000"
}
```

### Step 3: Update Frontend Config (30 seconds)

**File:** `Auto_QA-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Restart Servers (30 seconds)

```bash
# Backend
cd Auto_QA-backend
npm run dev

# Frontend (new terminal)
cd Auto_QA-web
npm run dev
```

### Step 5: Test! (30 seconds)

1. Open: `http://localhost:3000/login`
2. Click "Continue with Google"
3. Login with your Google account
4. ✅ Done! You're in the dashboard!

---

## ✅ What You Get

- ✅ Google login button on login page
- ✅ Automatic account creation
- ✅ Profile picture sync
- ✅ Email verification (automatic)
- ✅ Secure JWT authentication

---

## 🔍 Verify It Works

**Check Backend:**
```bash
curl http://localhost:3001/api/v1/auth/google/status
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "googleAuthEnabled": true
  }
}
```

---

## 🛠️ Troubleshooting

### "Google OAuth is not configured"
→ Check `env.json` has CLIENT_ID and CLIENT_SECRET  
→ Restart backend server

### "Redirect URI mismatch"
→ Ensure Google Console redirect URI matches exactly:  
   `http://localhost:3001/api/v1/auth/google/callback`

### "No email provided"
→ Check OAuth consent screen has `userinfo.email` scope

---

## 📚 Full Documentation

See `GOOGLE_OAUTH_SETUP.md` for:
- Detailed setup instructions
- Production deployment guide
- Security considerations
- Troubleshooting guide

---

**Status:** ✅ READY  
**Time to Setup:** 5 minutes  
**Difficulty:** Easy 🟢


