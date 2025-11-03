/**
 * Google OAuth 2.0 Configuration
 * Setup for Google Social Login
 */

export const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  scope: ['profile', 'email'],
  // Request user profile and email
  profileFields: ['id', 'displayName', 'emails', 'photos']
};

// Validate configuration
export const validateGoogleOAuthConfig = (): boolean => {
  if (!googleOAuthConfig.clientID) {
    console.error('❌ GOOGLE_CLIENT_ID is not set in environment variables');
    return false;
  }
  
  if (!googleOAuthConfig.clientSecret) {
    console.error('❌ GOOGLE_CLIENT_SECRET is not set in environment variables');
    return false;
  }
  
  return true;
};


