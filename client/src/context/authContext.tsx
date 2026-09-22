import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi";

import { getCsrfToken } from "../api/csrf";
import { setCsrfToken } from "../api/apiClient";

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    data: LoginRequest
  ) => Promise<void>;

  register: (
    data: RegisterRequest
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { csrfToken } =
          await getCsrfToken();

        setCsrfToken(csrfToken);

        const currentUser =
          await getCurrentUser();

        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(data: LoginRequest) {
    const response =
      await loginUser(data);

    setUser(response.user);
  }

  async function register(
    data: RegisterRequest
  ) {
    const response =
      await registerUser(data);

    setUser(response.user);
  }

  async function logout() {
    await logoutUser();

    setUser(null);
  }

  async function refreshUser() {
    try {
      const currentUser =
        await getCurrentUser();

      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}