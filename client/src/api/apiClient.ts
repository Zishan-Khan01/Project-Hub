const API_URL = "http://localhost:3000/api";

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

export async function handleResponse<T>(
  response: Response
): Promise<T> {
  let data: any = null;

  try {
    data = await response.json();
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
        data?.error || "You do not have permission to perform this action",
        403,
        data?.details
      );
    }

    if (response.status === 404) {
      throw new ApiError(
        data?.error || "The requested resource was not found",
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
        data?.error || "Server error. Please try again later.",
        response.status,
        data?.details
      );
    }

    throw new ApiError(
      data?.error || "Something went wrong. Please try again.",
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

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0
    );
  }

  return handleResponse<T>(response);
}

export { API_URL };