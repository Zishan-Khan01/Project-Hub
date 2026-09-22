import type {
  CreateProjectRequest,
  Project,
} from "../types/project";

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

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(
    `${API_URL}/projects`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    projects: Project[];
  }>(response);

  return data.projects;
}

export async function createProject(
  project: CreateProjectRequest
): Promise<Project> {
  const response = await fetch(
    `${API_URL}/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(project),
    }
  );

  const data = await handleResponse<{
    project: Project;
  }>(response);

  return data.project;
}

export async function deleteProject(
  projectId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleResponse(response);
}