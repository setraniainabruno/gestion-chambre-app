import { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email && password) {
        const res = await api.post(
          "/auth/login",
          { email, mdp: password },
          { headers: { "Content-Type": "application/json" } }
        );

        if (res.data) {
          sessionStorage.setItem("user", JSON.stringify(res.data.utilisateur));
          sessionStorage.setItem("token", res.data.token);
          setUser(res.data.utilisateur);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  setTimeout(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (location.pathname === "/login") {
      logout();
    }
  }, 5000);


  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!sessionStorage.getItem('user') }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
