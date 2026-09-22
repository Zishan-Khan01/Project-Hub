import { useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeamMembers,
  getTeams,
  removeTeamMember,
} from "../api/teamApi";

import { getUsers } from "../api/userApi";

import type {
  Team,
  TeamMember,
} from "../types/team";

import type { User } from "../types/auth";

export default function Teams() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const selectedTeamId =
    searchParams.get("team");

  const [teams, setTeams] = useState<Team[]>(
    []
  );

  const [users, setUsers] = useState<User[]>(
    []
  );

  const [selectedTeam, setSelectedTeam] =
    useState<Team | null>(null);

  const [members, setMembers] =
    useState<TeamMember[]>([]);

  const [loading, setLoading] = useState(true);

  const [membersLoading, setMembersLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [teamName, setTeamName] =
    useState("");

  const [selectedUserId, setSelectedUserId] =
    useState("");

  async function loadTeams() {
    try {
      setLoading(true);
      setError("");

      const [teamData, userData] =
        await Promise.all([
          getTeams(),
          getUsers(),
        ]);

      setTeams(teamData);
      setUsers(userData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load teams"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  /*
   * Restore selected team from URL
   * after refresh.
   */
  useEffect(() => {
    if (
      !selectedTeamId ||
      teams.length === 0
    ) {
      return;
    }

    const team = teams.find(
      (team) =>
        team.id === selectedTeamId
    );

    if (team) {
      loadMembers(team);
    }
  }, [selectedTeamId, teams]);

  async function loadMembers(
    team: Team
  ) {
    try {
      setSelectedTeam(team);
      setMembersLoading(true);
      setError("");

      const data =
        await getTeamMembers(team.id);

      setMembers(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load team members"
      );
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleCreateTeam(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!teamName.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const team = await createTeam({
        name: teamName.trim(),
      });

      setTeams((current) => [
        team,
        ...current,
      ]);

      setTeamName("");
      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create team"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTeam(
    teamId: string
  ) {
    try {
      setError("");

      await deleteTeam(teamId);

      setTeams((current) =>
        current.filter(
          (team) => team.id !== teamId
        )
      );

      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
        setMembers([]);

        navigate("/teams");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete team"
      );
    }
  }

  function handleSelectTeam(
    team: Team
  ) {
    navigate(`/teams?team=${team.id}`);
  }

  async function handleAddMember() {
    if (
      !selectedTeam ||
      !selectedUserId
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addTeamMember(
        selectedTeam.id,
        selectedUserId
      );

      /*
       * Important:
       * The POST endpoint only returns
       * membership data, not user details.
       *
       * Reload the complete member list.
       */
      const updatedMembers =
        await getTeamMembers(
          selectedTeam.id
        );

      setMembers(updatedMembers);

      setSelectedUserId("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add member"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(
    userId: string
  ) {
    if (!selectedTeam) {
      return;
    }

    try {
      setError("");

      await removeTeamMember(
        selectedTeam.id,
        userId
      );

      const updatedMembers =
        await getTeamMembers(
          selectedTeam.id
        );

      setMembers(updatedMembers);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove member"
      );
    }
  }

  const availableUsers = users.filter(
    (user) =>
      !members.some(
        (member) =>
          member.user.id === user.id
      )
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            {/* Same header styling as Projects */}
            <div className="flex items-center gap-2">

              <div className="rounded-lg bg-gray-100 p-2">
                <Users
                  size={21}
                  className="text-gray-700"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Teams
              </h1>

              {!loading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {teams.length}
                </span>
              )}

            </div>

            {/* Same subheading styling as Projects */}
            <p className="mt-1 text-sm text-gray-500">
              Organize users into project teams.
            </p>

          </div>

          {/* Same button styling as New Project */}
          <button
            type="button"
            onClick={() =>
              setShowForm(
                (current) => !current
              )
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />

            {showForm
              ? "Cancel"
              : "New Team"}
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}


        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreateTeam}
            className="mt-6 rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold">
              Create Team
            </h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">

              <input
                type="text"
                value={teamName}
                onChange={(event) =>
                  setTeamName(
                    event.target.value
                  )
                }
                required
                maxLength={100}
                className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                placeholder="Frontend Team"
              />

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-5 py-2 font-medium text-white disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Team"}
              </button>

            </div>
          </form>
        )}


        {/* Main */}
        {loading ? (
          <div className="mt-8 text-center text-sm text-gray-500">
            Loading teams...
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* Teams */}
            <div className="lg:col-span-1">

              <div className="rounded-xl border border-gray-200 bg-white">

                <div className="border-b p-5">
                  <h2 className="font-semibold">
                    Your Teams
                  </h2>
                </div>

                {teams.length === 0 ? (
                  <div className="p-8 text-center">

                    <Users
                      size={36}
                      className="mx-auto text-gray-400"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                      No teams yet.
                    </p>

                  </div>
                ) : (
                  <div className="divide-y">

                    {teams.map((team) => (

                      <div
                        key={team.id}
                        className={`
                          flex items-center justify-between
                          gap-3 p-4
                          ${
                            selectedTeam?.id ===
                            team.id
                              ? "bg-gray-50"
                              : ""
                          }
                        `}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectTeam(
                              team
                            )
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >

                          <div className="rounded-lg bg-gray-100 p-2">
                            <Users
                              size={18}
                              className="text-gray-700"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium">
                              {team.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              View members
                            </p>

                          </div>

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTeam(
                              team.id
                            )
                          }
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete team"
                          aria-label={`Delete ${team.name}`}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    ))}

                  </div>
                )}

              </div>

            </div>


            {/* Details */}
            <div className="lg:col-span-2">

              {!selectedTeam ? (

                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">

                  <div className="text-center">

                    <Users
                      size={40}
                      className="mx-auto text-gray-400"
                    />

                    <p className="mt-3 font-medium">
                      Select a team
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Select a team to manage its members.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="rounded-xl border border-gray-200 bg-white">

                  {/* Team header */}
                  <div className="flex items-center justify-between border-b p-5">

                    <div>

                      <h2 className="text-lg font-semibold">
                        {selectedTeam.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {members.length}{" "}
                        {members.length === 1
                          ? "member"
                          : "members"}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeam(null);
                        setMembers([]);
                        navigate("/teams");
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                      aria-label="Close team details"
                    >
                      <X size={19} />
                    </button>

                  </div>


                  {/* Add member */}
                  <div className="border-b p-5">

                    <h3 className="text-sm font-semibold">
                      Add member
                    </h3>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                      <select
                        value={selectedUserId}
                        onChange={(event) =>
                          setSelectedUserId(
                            event.target.value
                          )
                        }
                        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                      >

                        <option value="">
                          Select a user
                        </option>

                        {availableUsers.map(
                          (user) => (

                            <option
                              key={user.id}
                              value={user.id}
                            >
                              {user.name} —{" "}
                              {user.email}
                            </option>

                          )
                        )}

                      </select>

                      <button
                        type="button"
                        onClick={
                          handleAddMember
                        }
                        disabled={
                          !selectedUserId ||
                          saving
                        }
                        className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {saving
                          ? "Adding..."
                          : "Add Member"}
                      </button>

                    </div>

                  </div>


                  {/* Members */}
                  <div className="p-5">

                    {membersLoading ? (

                      <p className="text-sm text-gray-500">
                        Loading members...
                      </p>

                    ) : members.length === 0 ? (

                      <div className="py-8 text-center">

                        <p className="text-sm text-gray-500">
                          No members in this team.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {members.map(
                          (member) => (

                            <div
                              key={
                                member.membershipId
                              }
                              className="flex items-center justify-between rounded-lg border p-3"
                            >

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                                  {member.user.name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-medium">
                                    {member.user.name}
                                  </p>

                                  <p className="truncate text-xs text-gray-500">
                                    {member.user.email}
                                  </p>

                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveMember(
                                    member.user.id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                title="Remove member"
                                aria-label={`Remove ${member.user.name}`}
                              >
                                <X size={17} />
                              </button>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

              )}

            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}