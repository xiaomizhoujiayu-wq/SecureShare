import { createContext, useContext, useState } from 'react';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: any;
  handleLoginSuccess: (result: any, email: string) => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (result: any, email: string) => {
    // --- get result ---
    localStorage.setItem('auth_token', result.token);
    
    // 
    let rawAttrs = result.attributes || [];
    if (typeof rawAttrs === 'string') {
      rawAttrs = rawAttrs.includes(',') ? rawAttrs.split(',') : [rawAttrs];
    }
    localStorage.setItem('user_attributes', JSON.stringify(rawAttrs));
    
    // 
    localStorage.setItem('username', result.username);
    localStorage.setItem('user_role', result.role);
    localStorage.setItem('user_id', result.id || result.userId);

    // 
    setUser({ ...result, email });

    // 
    if (result.role === 'admin') {
      setLocation('/dashboard'); // admin pannel
    } else {
      setLocation('/dashboard'); // normal user pannel
    }
  };

  return (
    <AuthContext.Provider value={{ user, handleLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
};