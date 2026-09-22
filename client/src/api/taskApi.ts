import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "../types/task";

import { apiRequest } from "./apiClient";

export async function getTasks(): Promise<Task[]> {
  const data = await apiRequest<{
    tasks: Task[];
  }>("/tasks", {
    method: "GET",
  });

  return data.tasks;
}

export async function createTask(
  task: CreateTaskRequest
): Promise<Task> {
  const data = await apiRequest<{
    task: Task;
  }>("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  return data.task;
}

export async function updateTask(
  taskId: string,
  task: UpdateTaskRequest
): Promise<Task> {
  const data = await apiRequest<{
    task: Task;
  }>(`/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  return data.task;
}

export async function deleteTask(
  taskId: string
): Promise<void> {
  await apiRequest(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}