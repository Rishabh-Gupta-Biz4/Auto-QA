# Redux Implementation Guide

## Overview

This document explains the Redux implementation in the Auto QA web application. We've migrated from localStorage-based state management to Redux Toolkit for better state management, type safety, and developer experience.

## What Was Changed

### 1. **Dependencies Added**
- `@reduxjs/toolkit` - Modern Redux with simplified API
- `react-redux` - React bindings for Redux

### 2. **Redux Store Structure**

```
src/redux/
├── store.ts              # Store configuration with localStorage sync
├── hooks.ts              # Typed Redux hooks (useAppDispatch, useAppSelector)
├── ReduxProvider.tsx     # Redux Provider component
└── slices/
    ├── authSlice.ts      # Authentication state management
    └── registrationSlice.ts  # Registration state management
```

## State Management

### Auth State (authSlice.ts)

**Managed State:**
- `user` - User information (name, email, plan)
- `isAuthenticated` - Authentication status
- `token` - JWT access token
- `refreshToken` - JWT refresh token
- `isLoading` - Loading state

**Actions:**
- `login()` - Set user and tokens on login
- `logout()` - Clear all auth state
- `setUser()` - Update user information
- `setTokens()` - Update tokens
- `setLoading()` - Update loading state
- `initializeAuth()` - Initialize auth state from localStorage on app load

**Usage Example:**
```typescript
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { login, logout } from '@/redux/slices/authSlice';

// In your component
const dispatch = useAppDispatch();
const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

// Login
dispatch(login({
  user: { name: 'John', email: 'john@example.com', plan: 'Premium' },
  token: 'access_token',
  refreshToken: 'refresh_token'
}));

// Logout
dispatch(logout());
```

### Registration State (registrationSlice.ts)

**Managed State:**
- `pendingRegistration` - Temporary registration data for OTP verification

**Actions:**
- `setPendingRegistration()` - Store registration data
- `clearPendingRegistration()` - Clear registration data after verification
- `initializeRegistration()` - Initialize from localStorage

**Usage Example:**
```typescript
import { useAppDispatch } from '@/redux/hooks';
import { setPendingRegistration, clearPendingRegistration } from '@/redux/slices/registrationSlice';

// Store registration data
dispatch(setPendingRegistration({
  name: 'John',
  email: 'john@example.com',
  password: 'password',
  role: 'qa_engineer'
}));

// Clear after verification
dispatch(clearPendingRegistration());
```

## localStorage Synchronization

The Redux store automatically syncs with localStorage for persistence:

1. **On state change**: Redux state is saved to localStorage
2. **On app load**: localStorage data is loaded into Redux store
3. **On logout**: Both Redux state and localStorage are cleared

This ensures:
- State persists across page refreshes
- Backward compatibility with existing localStorage usage
- Seamless migration without data loss

## Updated Components

### 1. **Layout (app/layout.tsx)**
- Added `ReduxProvider` wrapper around the entire app
- Redux must be initialized before `AuthProvider`

### 2. **Auth Context (contexts/auth-context.tsx)**
- Now uses Redux for state instead of internal useState
- Login/logout actions dispatch to Redux
- Reads auth state from Redux store

### 3. **Auth Forms (hooks/useAuthForms.ts)**
- Registration hook dispatches to Redux instead of localStorage
- Stores pending registration data in Redux

### 4. **OTP Verification (app/verify-otp/page.tsx)**
- Reads pending registration from Redux
- Clears Redux state after successful verification

### 5. **Dashboard Pages**
- `app/dashboard/page.tsx`
- `app/dashboard/quick-launch/page.tsx`
- `components/dashboard-overview.tsx`
- All now use `useAppSelector` to get token from Redux instead of localStorage

## Benefits of Redux Implementation

### 1. **Centralized State Management**
- Single source of truth for application state
- Predictable state updates through actions
- Easy to debug with Redux DevTools

### 2. **Type Safety**
- Full TypeScript support
- Typed actions and state
- Compile-time error checking

### 3. **Better Developer Experience**
- Redux DevTools integration
- Time-travel debugging
- State persistence visualization

### 4. **Scalability**
- Easy to add new slices/features
- Middleware support for async operations
- Consistent patterns across the app

### 5. **Performance**
- Optimized re-renders with selector functions
- Memoization support
- Efficient state updates

## Usage Patterns

### Reading State
```typescript
import { useAppSelector } from '@/redux/hooks';

const MyComponent = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  return <div>Welcome, {user?.name}</div>;
};
```

### Updating State
```typescript
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  
  const handleLogin = () => {
    dispatch(login({
      user: userData,
      token: accessToken,
      refreshToken: refreshToken
    }));
  };
  
  return <button onClick={handleLogin}>Login</button>;
};
```

### Async Operations
```typescript
const handleLogin = async () => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    
    dispatch(login({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken
    }));
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Migration Summary

### Before (localStorage)
```typescript
localStorage.setItem('token', accessToken);
localStorage.setItem('user', JSON.stringify(user));
const token = localStorage.getItem('token');
```

### After (Redux)
```typescript
dispatch(login({ user, token, refreshToken }));
const token = useAppSelector((state) => state.auth.token);
```

## Testing the Implementation

1. **Login Flow**
   - Login from `/login` page
   - Verify token is stored in Redux
   - Check localStorage for backup copy
   - Refresh page and verify state persists

2. **Registration Flow**
   - Register from `/register` page
   - Verify pending registration data in Redux
   - Complete OTP verification
   - Check that pending data is cleared

3. **Dashboard Access**
   - Navigate to dashboard pages
   - Verify API calls use Redux token
   - Check that data loads correctly

4. **Logout Flow**
   - Click logout
   - Verify Redux state is cleared
   - Check that localStorage is cleared
   - Verify redirect to login page

## Future Enhancements

1. **Redux Persist**
   - Consider using `redux-persist` for more robust persistence
   - Configure whitelist/blacklist for state persistence

2. **Async Thunks**
   - Move API calls into Redux thunks
   - Centralize all async operations

3. **State Normalization**
   - Normalize complex nested data
   - Use entity adapters for better performance

4. **Middleware**
   - Add custom middleware for API error handling
   - Implement request/response interceptors

5. **Redux DevTools**
   - Configure Redux DevTools for production debugging
   - Add action logging and state snapshots

## Troubleshooting

### State not persisting
- Check browser console for errors
- Verify localStorage is enabled in browser
- Check Redux DevTools for state updates

### Token not being sent in API calls
- Verify token exists in Redux state
- Check `useAppSelector` hook usage
- Ensure component is wrapped in `ReduxProvider`

### Re-render issues
- Use memoized selectors for complex state
- Check for unnecessary state updates
- Use React DevTools to profile components

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)

---

**Note:** The Redux implementation maintains backward compatibility with localStorage for a seamless transition. The store automatically syncs with localStorage, ensuring no data loss during the migration.




