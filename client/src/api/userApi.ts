import type { User } from "../types/auth";

import { apiRequest } from "./apiClient";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
  password?: string;
}

export async function getUsers(): Promise<User[]> {
  const data = await apiRequest<{
    users: User[];
  }>("/users", {
    method: "GET",
  });

  return data.users;
}

export async function getCurrentUser(): Promise<User> {
  const data = await apiRequest<{
    user: User;
  }>("/users/me", {
    method: "GET",
  });

  return data.user;
}

export async function createUser(
  user: CreateUserRequest
): Promise<User> {
  const data = await apiRequest<{
    user: User;
  }>("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  return data.user;
}

export async function updateUser(
  userId: string,
  user: UpdateUserRequest
): Promise<User> {
  const data = await apiRequest<{
    user: User;
  }>(`/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  return data.user;
}

export async function deleteUser(
  userId: string
): Promise<void> {
  await apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
}