export interface Project {
  id: string;
  name: string;
  description?: string | null;
  organizationId: string;
  teamId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  teamId?: string;
}