/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { createContext, useContext, useState } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: any;
  handleLoginSuccess: (result: any, email: string) => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  const handleLoginSuccess = (result: any, email: string) => {
    // --- get result ---
    localStorage.setItem("auth_token", result.token);

    //
    let rawAttrs = result.attributes || [];
    if (typeof rawAttrs === "string") {
      rawAttrs = rawAttrs.includes(",") ? rawAttrs.split(",") : [rawAttrs];
    }
    localStorage.setItem("user_attributes", JSON.stringify(rawAttrs));

    //
    localStorage.setItem("username", result.username);
    localStorage.setItem("user_role", result.role);
    localStorage.setItem("user_id", result.id || result.userId);

    //
    setUser({ ...result, email });

    //
    if (result.role === "admin") {
      setLocation("/home"); // admin pannel
    } else {
      setLocation("/home"); // normal user pannel
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
  if (context === undefined)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
