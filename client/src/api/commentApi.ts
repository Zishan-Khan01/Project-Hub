import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
} from "../types/comment";

import { apiRequest } from "./apiClient";

export async function getCommentsByTask(
  taskId: string
): Promise<Comment[]> {
  const data = await apiRequest<{
    comments: Comment[];
  }>(`/comments/task/${taskId}`, {
    method: "GET",
  });

  return data.comments;
}

export async function createComment(
  data: CreateCommentData
): Promise<Comment> {
  const result = await apiRequest<{
    message: string;
    comment: Comment;
  }>("/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return result.comment;
}

export async function updateComment(
  commentId: string,
  data: UpdateCommentData
): Promise<Comment> {
  const result = await apiRequest<{
    comment: Comment;
  }>(`/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return result.comment;
}

export async function deleteComment(
  commentId: string
): Promise<void> {
  await apiRequest(`/comments/${commentId}`, {
    method: "DELETE",
  });
}