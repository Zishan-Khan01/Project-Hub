import type {
  CreateTeamRequest,
  Team,
  TeamMember,
} from "../types/team";

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

export async function getTeams(): Promise<Team[]> {
  const response = await fetch(
    `${API_URL}/teams`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    teams: Team[];
  }>(response);

  return data.teams;
}

export async function createTeam(
  data: CreateTeamRequest
): Promise<Team> {
  const response = await fetch(
    `${API_URL}/teams`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await handleResponse<{
    team: Team;
  }>(response);

  return result.team;
}

export async function deleteTeam(
  teamId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/teams/${teamId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleResponse(response);
}

export async function getTeamMembers(
  teamId: string
): Promise<TeamMember[]> {
  const response = await fetch(
    `${API_URL}/teams/${teamId}/members`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await handleResponse<{
    team: {
      id: string;
      name: string;
    };
    members: TeamMember[];
  }>(response);

  return data.members;
}

export async function addTeamMember(
  teamId: string,
  userId: string
): Promise<TeamMember> {
  const response = await fetch(
    `${API_URL}/teams/${teamId}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId,
      }),
    }
  );

  const data = await handleResponse<{
    message: string;
    member: {
      id: string;
      teamId: string;
      userId: string;
      joinedAt: string;
    };
  }>(response);

  /*
   * The backend does not return the user's
   * details here, so we return only the
   * membership data.
   *
   * The Teams page will reload the members
   * after adding.
   */
  return data.member as TeamMember;
}

export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/teams/${teamId}/members`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId,
      }),
    }
  );

  await handleResponse(response);
}