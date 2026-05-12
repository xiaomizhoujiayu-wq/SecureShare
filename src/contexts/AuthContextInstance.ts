import { createContext } from 'react';

export interface UserData {
  token: string;
  attributes: string | string[];
  username: string;
  role: string;
  id?: number;
  userId?: number;
  email?: string;
}

export interface AuthContextType {
  user: UserData | null;
  handleLoginSuccess: (result: UserData, email: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
