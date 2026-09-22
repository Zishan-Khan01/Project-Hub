import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

import { apiRequest } from "./apiClient";

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });
}

export async function loginUser(
  data: LoginRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(): Promise<User> {
  const data = await apiRequest<{ user: User }>(
    "/users/me",
    {
      method: "GET",
    }
  );

  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiRequest("/auth/logout", {
    method: "POST",
  });
}