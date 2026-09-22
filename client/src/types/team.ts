export interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
  };
}

export interface CreateTeamRequest {
  name: string;
}