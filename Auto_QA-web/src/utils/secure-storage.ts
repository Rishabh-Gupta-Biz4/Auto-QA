// âš ï¸ Client-side secure storage wrapper using SecureLS (AES)
// Requires NEXT_PUBLIC_SECURE_LS_SECRET to be set in the environment for proper encryption.

'use client';

import SecureLS from 'secure-ls';

const encryptionSecret = process.env.NEXT_PUBLIC_SECURE_LS_SECRET || '';

// Lazy initialization to avoid SSR issues with localStorage
let ls: SecureLS | null = null;

function getSecureLS(): SecureLS | null {
  // Only initialize on the client side
  if (typeof window === 'undefined') {
    return null;
  }

  if (!ls) {
    try {
      ls = new SecureLS({
        encodingType: 'aes',
        isCompression: false,
        encryptionSecret,
      });
    } catch (error) {
      // Fallback: return null if SecureLS initialization fails
      console.error('Failed to initialize SecureLS:', error);
      return null;
    }
  }

  return ls;
}

export const secureStorage = {
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return; // No-op on server side
    }

    try {
      const storage = getSecureLS();
      if (storage) {
        storage.set(key, value);
      }
    } catch (error) {
      // Fallback: no-op on storage failure
    }
  },
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null; // Return null on server side
    }

    try {
      const storage = getSecureLS();
      if (storage) {
        const val = storage.get(key);
        return (val as T) ?? null;
      }
    } catch (error) {
      return null;
    }

    return null;
  },
  remove(key: string): void {
    if (typeof window === 'undefined') {
      return; // No-op on server side
    }

    try {
      const storage = getSecureLS();
      if (storage) {
        storage.remove(key);
      }
    } catch (error) {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  authState: 'authState',
} as const;


