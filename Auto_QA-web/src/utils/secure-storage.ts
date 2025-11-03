// ⚠️ Client-side secure storage wrapper using SecureLS (AES)
// Requires NEXT_PUBLIC_SECURE_LS_SECRET to be set in the environment for proper encryption.

'use client';

import SecureLS from 'secure-ls';

const encryptionSecret = process.env.NEXT_PUBLIC_SECURE_LS_SECRET || '';

const ls = new SecureLS({
  encodingType: 'aes',
  isCompression: false,
  encryptionSecret,
});

export const secureStorage = {
  set<T>(key: string, value: T): void {
    try {
      ls.set(key, value);
    } catch (error) {
      // Fallback: no-op on storage failure
    }
  },
  get<T>(key: string): T | null {
    try {
      const val = ls.get(key);
      return (val as T) ?? null;
    } catch (error) {
      return null;
    }
  },
  remove(key: string): void {
    try {
      ls.remove(key);
    } catch (error) {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  authState: 'authState',
} as const;


