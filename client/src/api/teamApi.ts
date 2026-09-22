import type {
  CreateTeamRequest,
  Team,
  TeamMember,
} from "../types/team";

import { apiRequest } from "./apiClient";

export async function getTeams(): Promise<Team[]> {
  const data = await apiRequest<{
    teams: Team[];
  }>("/teams", {
    method: "GET",
  });

  return data.teams;
}

export async function createTeam(
  data: CreateTeamRequest
): Promise<Team> {
  const result = await apiRequest<{
    message: string;
    team: Team;
  }>("/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return result.team;
}

export async function deleteTeam(
  teamId: string
): Promise<void> {
  await apiRequest(`/teams/${teamId}`, {
    method: "DELETE",
  });
}

export async function getTeamMembers(
  teamId: string
): Promise<TeamMember[]> {
  const data = await apiRequest<{
    team: {
      id: string;
      name: string;
    };
    members: TeamMember[];
  }>(`/teams/${teamId}/members`, {
    method: "GET",
  });

  return data.members;
}

export async function addTeamMember(
  teamId: string,
  userId: string
): Promise<TeamMember> {
  const data = await apiRequest<{
    message: string;
    member: TeamMember;
  }>(`/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
  });

  return data.member;
}

export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<void> {
  await apiRequest(`/teams/${teamId}/members`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
    }),
  });
}