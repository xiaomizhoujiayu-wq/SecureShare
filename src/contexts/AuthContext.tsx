import { useState } from 'react';
import { useLocation } from 'wouter';
import { AuthContext, type UserData } from './AuthContextInstance';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (result: UserData, email: string) => {
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
    localStorage.setItem('user_id', String(result.id || result.userId));

    // 
    setUser({ ...result, email });

    // 
    setLocation('/home');
  };

  return (
    <AuthContext.Provider value={{ user, handleLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};
