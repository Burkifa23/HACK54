// Login and registration page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
  onRegister: (username: string, email: string, password: string) => boolean;
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const success = onLogin(formData.username, formData.password);
      if (success) {
        // Redirect will be handled by App component based on user role
      } else {
        setError('Invalid username or password');
      }
    } else {
      // Register mode
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      const success = onRegister(formData.username, formData.email, formData.password);
      if (success) {
        navigate('/');
      } else {
        setError('Username or email already exists');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="border-2 border-black p-8">
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mb-6">
            {mode === 'login' 
              ? 'Access your account or continue as guest' 
              : 'Register for a free account'}
          </p>

          {error && (
            <div className="mb-4 p-3 border-2 border-red-500 bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 border-2 border-black"
                required
                autoComplete="username"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  required
                  autoComplete="email"
                />
              </div>
            )}

            <div>
              <label className="block font-bold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border-2 border-black"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 border-2 border-black"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-colors font-bold"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <>
                <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                <button
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-sm underline hover:text-gray-600"
                >
                  Sign up for free
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-sm underline hover:text-gray-600"
                >
                  Login here
                </button>
              </>
            )}
          </div>

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <p className="text-sm font-bold mb-3">Demo Accounts:</p>
              <div className="space-y-2 text-xs bg-gray-50 p-3">
                <div>
                  <div className="font-bold">Admin:</div>
                  <div>Username: admin / Password: admin123</div>
                </div>
                <div>
                  <div className="font-bold">Pharmacy:</div>
                  <div>Username: medplus / Password: medplus123</div>
                </div>
                <div className="text-gray-600 mt-2">
                  Or register a new public user account above
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
