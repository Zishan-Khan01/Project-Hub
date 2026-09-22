import type { User } from "../types/auth";

const API_URL = "http://localhost:3000/api";

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Something went wrong"
    );
  }

  return data;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(
    `${API_URL}/users`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    users: User[];
  }>(response);

  return data.users;
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    user: User;
  }>(response);

  return data.user;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
}

export async function createUser(
  user: CreateUserRequest
): Promise<User> {
  const response = await fetch(
    `${API_URL}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    }
  );

  const data = await handleResponse<{
    user: User;
  }>(response);

  return data.user;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
}

export async function updateUser(
  userId: string,
  user: UpdateUserRequest
): Promise<User> {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    }
  );

  const data = await handleResponse<{
    user: User;
  }>(response);

  return data.user;
}

export async function deleteUser(
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleResponse(response);
}