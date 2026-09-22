import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
} from "../types/comment";

const API_URL = "http://localhost:3000/api";

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/auth/csrf-token`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get CSRF token");
  }

  const data = await response.json();

  return data.csrfToken;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || "Something went wrong. Please try again."
    );
  }

  return data as T;
}

export async function getCommentsByTask(
  taskId: string
): Promise<Comment[]> {
  const response = await fetch(
    `${API_URL}/comments/task/${taskId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const result = await handleResponse<{
    comments: Comment[];
  }>(response);

  return result.comments;
}

export async function createComment(
  data: CreateCommentData
): Promise<Comment> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_URL}/comments`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<{
    message: string;
    comment: Comment;
  }>(response);

  return result.comment;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<Comment> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(
    `${API_URL}/comments/${commentId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(data),
    }
  );

  return handleResponse<Comment>(response);
}

export async function deleteComment(
  commentId: string
): Promise<void> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(
    `${API_URL}/comments/${commentId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );

  await handleResponse<{ message?: string }>(response);
}