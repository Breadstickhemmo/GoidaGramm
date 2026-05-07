import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (newUserData: any) => {
    setUser(newUserData);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      if (localStorage.getItem('token')) {
        logout();
        toast.error('Сеанс завершен из-за бездействия (60 минут)', {
          duration: 6000,
          position: 'bottom-center'
        });
      }
    }, 60 * 60 * 1000);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    if (user) {
      resetInactivityTimer();
      events.forEach(event => window.addEventListener(event, handleUserActivity));
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login: (u: any, t: string) => { localStorage.setItem('token', t); setUser(u); }, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);