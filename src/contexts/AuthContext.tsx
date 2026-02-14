import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { signin, signup, logout as apiLogout, refresh, updateAvatar as apiUpdateAvatar, onAuthExpired } from "../api";
import type { ApiUser } from "../types/api";

interface AuthState {
  isLoggedIn: boolean;
  user: ApiUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: File) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  /** Atalhos para uso em componentes */
  userName: string | null;
  userAvatar: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
  });

  // Quando a sessão expirar (401 + refresh falhou), faz logout local
  useEffect(() => {
    return onAuthExpired(() => {
      localStorage.removeItem("c315_user");
      setAuth({ isLoggedIn: false, user: null, loading: false });
    });
  }, []);

  // Tenta restaurar sessão via refresh token ao montar
  useEffect(() => {
    refresh()
      .then((ok) => {
        if (ok) {
          const saved = localStorage.getItem("c315_user");
          if (saved) {
            const user: ApiUser = JSON.parse(saved);
            setAuth({ isLoggedIn: true, user, loading: false });
            return;
          }
        }
        // Refresh falhou ou sem user salvo
        localStorage.removeItem("c315_user");
        setAuth({ isLoggedIn: false, user: null, loading: false });
      })
      .catch(() => {
        localStorage.removeItem("c315_user");
        setAuth({ isLoggedIn: false, user: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await signin(email, password);
    localStorage.setItem("c315_user", JSON.stringify(res.user));
    setAuth({ isLoggedIn: true, user: res.user, loading: false });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, avatar?: File) => {
    await signup(name, email, password, avatar);
    // Após registro, faz login automático
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignora erro de logout (token pode já ter expirado)
    }
    localStorage.removeItem("c315_user");
    setAuth({ isLoggedIn: false, user: null, loading: false });
  }, []);

  const updateAvatar = useCallback(async (file: File) => {
    const updated = await apiUpdateAvatar(file);
    setAuth((prev) => ({ ...prev, user: updated }));
    localStorage.setItem("c315_user", JSON.stringify(updated));
  }, []);

  const value: AuthContextValue = {
    ...auth,
    login,
    register,
    logout,
    updateAvatar,
    userName: auth.user?.name ?? null,
    userAvatar: auth.user?.avatar ?? null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
