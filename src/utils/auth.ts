// Authentication utilities

import { User, UserRole } from './types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';
import { hashPassword, verifyPassword } from './encryption';

/**
 * Get current logged in user
 */
export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

/**
 * Set current user
 */
export function setCurrentUser(user: User | null): void {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

/**
 * Login user
 */
export function login(username: string, password: string): User | null {
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return null;
  }

  if (!verifyPassword(password, user.password)) {
    return null;
  }

  // Don't store password in current user
  const { password: _, ...userWithoutPassword } = user;
  const currentUser = { ...user, password: user.password }; // Keep for session
  setCurrentUser(currentUser);
  
  return currentUser;
}

/**
 * Register new public user
 */
export function register(username: string, email: string, password: string): User | null {
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  
  // Check if username or email already exists
  if (users.some(u => u.username === username || u.email === email)) {
    return null;
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    email,
    password: hashPassword(password),
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  setCurrentUser(newUser);
  
  return newUser;
}

/**
 * Logout current user
 */
export function logout(): void {
  setCurrentUser(null);
}

/**
 * Check if user has permission to access a route
 */
export function canAccessRoute(user: User | null, requiredRole?: UserRole): boolean {
  if (!requiredRole) {
    return true; // Public route
  }

  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true; // Admin can access everything
  }

  return user.role === requiredRole;
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
}
