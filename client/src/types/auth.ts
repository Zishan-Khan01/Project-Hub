export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}