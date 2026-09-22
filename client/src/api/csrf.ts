export async function getCsrfToken() {
  const response = await fetch(
    "http://localhost:3000/api/auth/csrf-token",
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