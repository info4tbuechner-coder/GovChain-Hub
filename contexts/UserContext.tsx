import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

// Mock Personas for the Demo
const PERSONAS: Record<string, User> = {
  ADMIN: {
    id: 'u-admin-001',
    email: 'admin@digital.bund.de',
    name: 'Dr. Erika Mustermann',
    role: UserRole.ADMIN,
    department: 'Ref. DG II 4 (Cybersecurity)',
    createdAt: new Date('2023-01-15')
  },
  EDITOR: {
    id: 'u-editor-042',
    email: 'sachbearbeitung@bva.bund.de',
    name: 'Max Mustermann',
    role: UserRole.EDITOR,
    department: 'BVA - Registermodernisierung',
    createdAt: new Date('2024-03-10')
  }
};

interface UserContextType {
  user: User | null;
  login: (role: 'ADMIN' | 'EDITOR') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'ADMIN' | 'EDITOR') => {
    // In a real app, this would validate a JWT token
    const persona = PERSONAS[role];
    setUser(persona);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </UserContext.Provider>
  );
};