export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface ApiErrorResponse {
  error?: string;
  details?: unknown;
}

export async function handleResponse<T>(
  response: Response
): Promise<T> {
  let data: ApiErrorResponse | null = null;

  try {
    data = (await response.json()) as ApiErrorResponse;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(
        data?.error || "Authentication required",
        401,
        data?.details
      );
    }

    if (response.status === 403) {
      throw new ApiError(
        data?.error ||
          "You do not have permission to perform this action",
        403,
        data?.details
      );
    }

    if (response.status === 404) {
      throw new ApiError(
        data?.error ||
          "The requested resource was not found",
        404,
        data?.details
      );
    }

    if (response.status === 400) {
      throw new ApiError(
        data?.error || "Invalid request",
        400,
        data?.details
      );
    }

    if (response.status >= 500) {
      throw new ApiError(
        data?.error ||
          "Server error. Please try again later.",
        response.status,
        data?.details
      );
    }

    throw new ApiError(
      data?.error ||
        "Something went wrong. Please try again.",
      response.status,
      data?.details
    );
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  const method = (
    options.method || "GET"
  ).toUpperCase();

  const headers = new Headers(options.headers);

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(
      method
    ) &&
    csrfToken
  ) {
    headers.set(
      "x-csrf-token",
      csrfToken
    );
  }

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
        credentials: "include",
      }
    );
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0
    );
  }

  return handleResponse<T>(response);
}