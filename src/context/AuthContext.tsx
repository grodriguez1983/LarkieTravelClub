import React, { createContext, useContext, useState } from 'react';
import { User, UserRegistrationType } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  registrationType: UserRegistrationType | null;
  setRegistrationType: (type: UserRegistrationType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registrationType, setRegistrationType] = useState<UserRegistrationType | null>(null);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      currentUser, 
      setCurrentUser,
      registrationType,
      setRegistrationType
    }}>
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