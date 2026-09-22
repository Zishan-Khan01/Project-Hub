import { API_URL } from "./apiClient";

export async function getCsrfToken() {
  const response = await fetch(
    `${API_URL}/auth/csrf-token`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get CSRF token");
  }

  return response.json() as Promise<{
    csrfToken: string;
  }>;
}