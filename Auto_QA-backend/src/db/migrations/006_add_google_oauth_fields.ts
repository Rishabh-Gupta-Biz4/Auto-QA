/**
 * Migration: Add Google OAuth fields to users table
 * Adds google_id and profile_picture columns
 */

export const addGoogleOAuthFields = `
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL UNIQUE AFTER email,
  ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) NULL AFTER google_id,
  ADD INDEX idx_google_id (google_id);
`;

export default addGoogleOAuthFields;


