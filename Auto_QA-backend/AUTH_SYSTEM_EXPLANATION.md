# SIMPLIFIED AUTH SYSTEM - COMPLETE EXPLANATION

This document explains every line of code in the simplified authentication system.

## 📁 FILE STRUCTURE

```
src/
├── services/
│   └── otp.service.ts          # OTP generation and verification
├── features/auth/
│   ├── auth.controller.ts      # Main auth logic
│   └── auth.routes.ts          # API endpoints
├── middleware/
│   └── auth.ts                 # JWT verification middleware
└── schema/
    └── validation.ts           # Request validation schemas
```

## 🔧 CORE COMPONENTS

### 1. OTP SERVICE (`src/services/otp.service.ts`)

**Purpose**: Handles OTP generation, storage, and verification

**Key Features**:
- Generates 6-digit random OTPs
- Stores OTPs in memory (not database)
- 10-minute expiry time
- 3 attempt limit per OTP
- Automatic cleanup of expired OTPs

**How it works**:
```typescript
// 1. Generate OTP
const otp = crypto.randomInt(100000, 999999).toString();

// 2. Store in memory with expiry
this.otpStorage.set(email, {
  email,
  otp,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  attempts: 0
});

// 3. Verify OTP
if (otpData.otp === userInputOTP) {
  return true; // Valid
}
```

### 2. AUTH CONTROLLER (`src/features/auth/auth.controller.ts`)

**Purpose**: Contains all authentication business logic

**Methods**:

#### `register()` - Start Registration
```typescript
// 1. Check if user exists
const [existingUsers] = await this.db.execute(
  'SELECT id FROM users WHERE email = ?', [email]
);

// 2. Generate OTP
const otp = await otpService.generateRegistrationOTP(email);

// 3. Return OTP info
res.status(200).json({
  success: true,
  message: 'OTP sent successfully',
  data: { email, expiresIn: 10, maxAttempts: 3 }
});
```

#### `verifyOTPAndRegister()` - Complete Registration
```typescript
// 1. Verify OTP
const isOTPValid = await otpService.verifyRegistrationOTP(email, otp);

// 2. Hash password
const hashedPassword = await hashPassword(password);

// 3. Create user in database
await this.db.execute(
  'INSERT INTO users (name, email, password, role, is_active, email_verified) VALUES (?, ?, ?, ?, true, true)',
  [name, email, hashedPassword, role]
);

// 4. Generate JWT token
const token = generateToken({ id: userId, email, role });

// 5. Return user data and token
res.status(201).json({
  success: true,
  data: { user: { id, name, email, role }, token }
});
```

#### `login()` - User Login
```typescript
// 1. Find user by email
const [users] = await this.db.execute(
  'SELECT * FROM users WHERE email = ? AND is_active = true', [email]
);

// 2. Verify password
const isPasswordValid = await comparePassword(password, user.password);

// 3. Generate JWT token
const token = generateToken({ id: user.id, email: user.email, role: user.role });

// 4. Update last login
await this.db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

// 5. Return user data and token
res.status(200).json({
  success: true,
  data: { user: sanitizeUser(user), token }
});
```

### 3. AUTH ROUTES (`src/features/auth/auth.routes.ts`)

**Purpose**: Defines API endpoints and applies middleware

**Routes**:

#### Public Routes (No Authentication Required)
```typescript
// Start registration
router.post('/register', 
  rateLimiterMiddleware,     // Prevent spam
  validate(registerSchema),  // Validate data
  authController.register    // Handle request
);

// Complete registration with OTP
router.post('/verify-otp-register',
  rateLimiterMiddleware,
  validate(verifyOTPAndRegisterSchema),
  authController.verifyOTPAndRegister
);

// User login
router.post('/login',
  rateLimiterMiddleware,
  validate(loginSchema),
  authController.login
);
```

#### Protected Routes (Authentication Required)
```typescript
// Get user profile
router.get('/profile',
  authMiddleware,           // Verify JWT token
  authController.getProfile // Handle request
);

// User logout
router.post('/logout',
  authMiddleware,          // Verify JWT token
  authController.logout    // Handle request
);
```

### 4. AUTH MIDDLEWARE (`src/middleware/auth.ts`)

**Purpose**: Verifies JWT tokens for protected routes

**How it works**:
```typescript
export const authMiddleware = async (req, res, next) => {
  // 1. Get Authorization header
  const authHeader = req.header('Authorization');
  
  // 2. Extract token from "Bearer <token>"
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  // 3. Check if token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // 4. Verify JWT token
  const decoded = verifyToken(token);
  
  // 5. Add user data to request
  req.user = decoded;

  // 6. Continue to next middleware
  next();
};
```

### 5. VALIDATION SCHEMAS (`src/schema/validation.ts`)

**Purpose**: Validates request data using Joi

**Schemas**:

#### Login Schema
```typescript
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});
```

#### Registration Schema
```typescript
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'qa_lead', 'qa_engineer', 'developer').optional()
});
```

#### OTP Verification Schema
```typescript
export const verifyOTPAndRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'qa_lead', 'qa_engineer', 'developer').optional(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required()
});
```

## 🔄 COMPLETE AUTH FLOW

### Registration Flow
1. **User submits registration form** → `POST /register`
2. **Server validates data** → Joi validation
3. **Server checks if user exists** → Database query
4. **Server generates OTP** → 6-digit random number
5. **Server stores OTP in memory** → With 10-minute expiry
6. **Server returns OTP info** → Client gets OTP details
7. **User enters OTP** → `POST /verify-otp-register`
8. **Server verifies OTP** → Check against stored OTP
9. **Server hashes password** → bcrypt
10. **Server creates user account** → Database insert
11. **Server generates JWT token** → For authentication
12. **Server returns user data and token** → Registration complete

### Login Flow
1. **User submits login form** → `POST /login`
2. **Server validates data** → Joi validation
3. **Server finds user by email** → Database query
4. **Server verifies password** → bcrypt comparison
5. **Server generates JWT token** → For authentication
6. **Server updates last login** → Database update
7. **Server returns user data and token** → Login complete

### Protected Route Access
1. **Client sends request with token** → `Authorization: Bearer <token>`
2. **Server extracts token** → From Authorization header
3. **Server verifies token** → JWT verification
4. **Server adds user to request** → `req.user = decoded`
5. **Server processes request** → Route handler executes
6. **Server returns response** → With user context

## 🛡️ SECURITY FEATURES

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Stateless authentication
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Joi schema validation
5. **OTP Expiry**: 10-minute time limit
6. **Attempt Limiting**: 3 tries per OTP
7. **Data Sanitization**: Remove sensitive fields

## 🚀 API ENDPOINTS

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/register` | Start registration | No |
| POST | `/verify-otp-register` | Complete registration | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |
| POST | `/logout` | User logout | Yes |

## 📝 EXAMPLE USAGE

### Registration
```bash
# Step 1: Start registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "qa_engineer"
  }'

# Response: { "success": true, "message": "OTP sent successfully" }
# Check server console for OTP: 123456

# Step 2: Complete registration
curl -X POST http://localhost:3001/api/v1/auth/verify-otp-register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "qa_engineer",
    "otp": "123456"
  }'

# Response: { "success": true, "data": { "user": {...}, "token": "..." } }
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Response: { "success": true, "data": { "user": {...}, "token": "..." } }
```

### Access Protected Route
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"

# Response: { "success": true, "data": { "user": {...} } }
```

This simplified auth system is now clean, well-documented, and easy to understand. Every line of code has a clear purpose and is explained in detail.

