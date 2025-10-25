// LocalStorage management utilities

/**
 * Safely get data from localStorage with JSON parsing
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely save data to localStorage with JSON stringification
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Storage full. Please clear old data.');
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage(): void {
  const keys = [
    'users',
    'symptoms',
    'pharmacies',
    'blogPosts',
    'historicalData',
    'predictions',
    'currentUser',
    'auditLog'
  ];
  keys.forEach(key => removeFromStorage(key));
}

// Storage keys constants
export const STORAGE_KEYS = {
  USERS: 'users',
  SYMPTOMS: 'symptoms',
  PHARMACIES: 'pharmacies',
  BLOG_POSTS: 'blogPosts',
  HISTORICAL_DATA: 'historicalData',
  PREDICTIONS: 'predictions',
  CURRENT_USER: 'currentUser',
  AUDIT_LOG: 'auditLog'
} as const;
