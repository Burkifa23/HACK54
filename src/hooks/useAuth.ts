// Authentication hook

import { useState, useEffect } from 'react';
import { User } from '../utils/types';
import { getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '../utils/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (username: string, password: string): User | null => {
    const loggedInUser = authLogin(username, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const register = (username: string, email: string, password: string): User | null => {
    const newUser = authRegister(username, email, password);
    setUser(newUser);
    return newUser;
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
}
