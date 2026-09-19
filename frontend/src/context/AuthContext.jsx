import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState('student'); // 'student' | 'senior' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setRole(res.data.user.role.toLowerCase());
          }
        } catch (err) {
          console.error('Failed to load user with token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(loggedInUser);
      setRole(loggedInUser.role.toLowerCase());
      return loggedInUser;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data.success) {
      const { user: registeredUser, token: authToken, corresAssignment } = res.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      const userWithCorres = {
        ...registeredUser,
        corres: corresAssignment?.senior || null,
        assignmentType: corresAssignment?.type || null,
      };
      setUser(userWithCorres);
      setRole(registeredUser.role.toLowerCase());
      return userWithCorres;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRole('student');
  };

  // Preview role switching (from prototype sidebar)
  const switchPreviewRole = async (newRole) => {
    const roleLower = newRole.toLowerCase();
    setRole(roleLower);

    const demoAccounts = {
      student: { email: 'ak@vitstudent.ac.in', password: 'password' },
      senior: { email: 'priya@vitstudent.ac.in', password: 'password' },
      admin: { email: 'admin@vitstudent.ac.in', password: 'password' },
    };

    const targetAccount = demoAccounts[roleLower];
    if (targetAccount) {
      try {
        const res = await authApi.login(targetAccount);
        if (res.data.success) {
          const { user: loggedInUser, token: authToken } = res.data;
          localStorage.setItem('token', authToken);
          setToken(authToken);
          setUser(loggedInUser);
        }
      } catch (err) {
        console.warn('Silent role switch login fallback:', err.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        switchPreviewRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

