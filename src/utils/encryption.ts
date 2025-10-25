// Data encryption utilities

/**
 * Encrypts sensitive data before storage
 * For MVP: Using Base64 encoding
 * Production: Use proper encryption library like crypto-js with AES-256
 */
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts data (admin only should call this)
 * Returns null if decryption fails
 */
export function decryptData(encrypted: string): any {
  try {
    const jsonString = atob(encrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Generates a random anonymous ID
 * Format: ANO + 8 random alphanumeric characters
 */
export function generateAnonymousId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  let id = 'ANO';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Simple password hashing (for MVP)
 * Production: Use bcrypt or similar
 */
export function hashPassword(password: string): string {
  // Very simple hash for MVP - NOT SECURE for production
  return btoa(password + '_hashed_salt_2025');
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
