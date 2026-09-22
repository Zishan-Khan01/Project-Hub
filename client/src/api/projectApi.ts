import type {
  CreateProjectRequest,
  Project,
} from "../types/project";

import { apiRequest } from "./apiClient";

export async function getProjects(): Promise<Project[]> {
  const data = await apiRequest<{
    projects: Project[];
  }>("/projects", {
    method: "GET",
  });

  return data.projects;
}

export async function createProject(
  project: CreateProjectRequest
): Promise<Project> {
  const data = await apiRequest<{
    project: Project;
  }>("/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  return data.project;
}

export async function deleteProject(
  projectId: string
): Promise<void> {
  await apiRequest(`/projects/${projectId}`, {
    method: "DELETE",
  });
}