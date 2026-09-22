import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "../types/task";

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

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    tasks: Task[];
  }>(response);

  return data.tasks;
}

export async function createTask(
  task: CreateTaskRequest
): Promise<Task> {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(task),
    }
  );

  const data = await handleResponse<{
    task: Task;
  }>(response);

  return data.task;
}

export async function updateTask(
  taskId: string,
  task: UpdateTaskRequest
): Promise<Task> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(task),
    }
  );

  const data = await handleResponse<{
    task: Task;
  }>(response);

  return data.task;
}

export async function deleteTask(
  taskId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleResponse(response);
}