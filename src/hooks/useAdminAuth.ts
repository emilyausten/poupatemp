import { useState, useEffect } from 'react';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'AV8BTCvaHAl8xWnW'
};

const STORAGE_KEY = 'admin-auth-session';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar se já está logado ao carregar
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.isAuthenticated && authData.timestamp) {
          // Verificar se o login não expirou (opcional: 7 dias)
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - authData.timestamp < sevenDays) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isAuthenticated: true,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};