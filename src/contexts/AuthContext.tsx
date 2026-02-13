import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  coachName: string | null;
  coachAvatar: string | null;
}

interface AuthContextValue extends AuthState {
  login: (name: string, avatar?: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    coachName: null,
    coachAvatar: null,
  });

  const login = useCallback((name: string, avatar?: string | null) => {
    setAuth({ isLoggedIn: true, coachName: name, coachAvatar: avatar ?? null });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, coachName: null, coachAvatar: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
