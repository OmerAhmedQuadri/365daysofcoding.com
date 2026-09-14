import { createContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthError('');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setAuthError('');
    getMe(token)
      .then(setUser)
      .catch((err) => {
        if (err.status === 401 || err.status === 404) {
          // Expired or invalid token, or the account no longer exists: sign out
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          // Server or database trouble: keep the session so a retry can restore it
          setAuthError(err.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [token, attempt]);

  function login(newToken) {
    localStorage.setItem('token', newToken);
    setIsLoading(true);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError('');
  }

  function retryAuth() {
    setAttempt((n) => n + 1);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, authError, login, logout, retryAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
