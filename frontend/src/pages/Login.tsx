import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shouldPulse, setShouldPulse] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  // const { showSuccess, showError } = useToast();

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    setShouldPulse(fieldName);
    setTimeout(() => setShouldPulse(null), 400);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // showSuccess('Welcome back!', { duration: 3000 });
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      // showError(error || 'Login failed. Please check your credentials.', { duration: 5000 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors duration-200 ease-soft">
      <div className="max-w-md w-full space-y-8 relative">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            Sign in to kTracker
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 dark:border-stone-600 dark:placeholder-stone-400 dark:text-stone-100 rounded-t-md focus:outline-none focus:border-sage-500 focus:z-10 sm:text-sm ${focusedField === 'email' ? (shouldPulse === 'email' ? 'animate-focus-ring-pulse-sage' : 'animate-focus-ring-expand-sage') : ''}`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => { e.preventDefault(); handleFocus('email'); }}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-stone-300 placeholder-stone-500 text-stone-900 dark:border-stone-600 dark:placeholder-stone-400 dark:text-stone-100 rounded-b-md focus:outline-none focus:border-sage-500 focus:z-10 sm:text-sm ${focusedField === 'password' ? (shouldPulse === 'password' ? 'animate-focus-ring-pulse-sage' : 'animate-focus-ring-expand-sage') : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => { e.preventDefault(); handleFocus('password'); }}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 animate-shake" role="alert" aria-live="assertive">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-base text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 disabled:opacity-50 transition-all duration-200 ease-soft"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium transition-colors duration-200 ease-soft"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;