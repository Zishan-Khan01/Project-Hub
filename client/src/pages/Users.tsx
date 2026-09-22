import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  X,
  Users as UsersIcon,
  AlertTriangle,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import { useAuth } from "../context/AuthContext";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "../api/userApi";

import type {
  User,
  UserRole,
} from "../types/auth";

export default function Users() {
  const {
    user: authUser,
    refreshUser,
  } = useAuth();

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [userToDelete, setUserToDelete] =
    useState<User | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState<UserRole>("DEVELOPER");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("DEVELOPER");
    setEditingUser(null);
  }

  function openCreateForm() {
    resetForm();
    setError("");
    setShowForm(true);
  }

  function openEditForm(user: User) {
    setEditingUser(user);

    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        /*
         * When editing the currently logged-in admin,
         * only send fields that they are allowed to change.
         *
         * This is important because sending:
         *
         * role: "ADMIN"
         *
         * would make the backend think that the user
         * is trying to change their own role.
         */
        const data: UpdateUserRequest = {
          name,
        };

        if (password.trim()) {
          data.password = password;
        }

        /*
         * Only send role when editing another user.
         * The current admin can change their name/password,
         * but cannot change their own role.
         */
        if (editingUser.id !== authUser?.id) {
          data.role = role;
        }

        const updatedUser =
          await updateUser(
            editingUser.id,
            data
          );

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === updatedUser.id
              ? updatedUser
              : user
          )
        );

        /*
         * Refresh the auth context when the currently
         * logged-in user updates their own information.
         */
        if (
          authUser?.id === updatedUser.id
        ) {
          await refreshUser();
        }
      } else {
        const data: CreateUserRequest = {
          name,
          email,
          password,
          role,
        };

        const createdUser =
          await createUser(data);

        setUsers((currentUsers) => [
          ...currentUsers,
          createdUser,
        ]);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal(user: User) {
    /*
     * Never allow the currently logged-in admin
     * to open the delete action for themselves.
     */
    if (user.id === authUser?.id) {
      return;
    }

    setUserToDelete(user);
    setError("");
  }

  function closeDeleteModal() {
    if (saving) {
      return;
    }

    setUserToDelete(null);
  }

  async function confirmDelete() {
    if (!userToDelete) {
      return;
    }

    /*
     * Extra frontend protection against self deletion.
     */
    if (userToDelete.id === authUser?.id) {
      setUserToDelete(null);

      setError(
        "You cannot delete your own account."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteUser(userToDelete.id);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !== userToDelete.id
        )
      );

      setUserToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user."
      );
    } finally {
      setSaving(false);
    }
  }

  const isAdmin =
    authUser?.role === "ADMIN";

  const isEditingCurrentUser =
    editingUser?.id === authUser?.id;

  return (
    <AppLayout>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="rounded-lg bg-gray-100 p-2">
                  <UsersIcon
                    size={21}
                    className="text-gray-700"
                  />
                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Users
                </h1>

                {!loading && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {users.length}
                  </span>
                )}

              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage users in your organization.
              </p>

            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (showForm) {
                    closeForm();
                  } else {
                    openCreateForm();
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
              >
                <Plus size={18} />

                {showForm
                  ? "Cancel"
                  : "Add User"}
              </button>
            )}

          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">

                <UsersIcon
                  size={32}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 text-sm text-gray-500">
                  No users found.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>

                      {isAdmin && (
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Actions
                        </th>
                      )}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {users.map((user) => {

                      const isCurrentUser =
                        user.id === authUser?.id;

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-gray-50"
                        >

                          {/* User */}
                          <td className="px-6 py-4">

                            <div>
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>

                              <p className="mt-0.5 text-sm text-gray-500">
                                {user.email}
                              </p>
                            </div>

                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">

                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                              {user.role
                                .replace(
                                  "_",
                                  " "
                                )
                                .toLowerCase()
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase()
                                )}
                            </span>

                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.createdAt
			      ? new Date(user.createdAt).toLocaleDateString()
			      : "—"}
                          </td>

                          {/* Actions */}
                          {isAdmin && (
                            <td className="px-6 py-4">

                              <div className="flex justify-end gap-2">

                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      user
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                  aria-label="Edit user"
                                  title="Edit user"
                                >
                                  <Pencil
                                    size={17}
                                  />
                                </button>

                                {/* Delete - unavailable for current admin */}
                                {!isCurrentUser && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDeleteModal(
                                        user
                                      )
                                    }
                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                    aria-label="Delete user"
                                    title="Delete user"
                                  >
                                    <Trash2
                                      size={17}
                                    />
                                  </button>
                                )}

                              </div>

                            </td>
                          )}

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {editingUser
                    ? "Edit User"
                    : "Add User"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingUser
                    ? "Update this user's information."
                    : "Add a new user to your organization."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  placeholder="Enter name"
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                  disabled={!!editingUser}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter email"
                />

                {editingUser && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Email cannot be changed.
                  </p>
                )}

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {editingUser
                    ? "New Password"
                    : "Password"}
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  required={!editingUser}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />

              </div>

              {/* Role */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target
                        .value as UserRole
                    )
                  }
                  disabled={
                    !!editingUser &&
                    isEditingCurrentUser
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                >

                  <option value="DEVELOPER">
                    Developer
                  </option>

                  <option value="PROJECT_MANAGER">
                    Project Manager
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>

                </select>

                {editingUser &&
                  isEditingCurrentUser && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Your own admin role cannot be changed.
                    </p>
                  )}

              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Add User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="rounded-lg bg-red-50 p-2.5">
                  <AlertTriangle
                    size={21}
                    className="text-red-600"
                  />
                </div>

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete User
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    This action cannot be undone.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {userToDelete.name}
                </span>
                ?
              </p>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Deleting..."
                    : "Delete User"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </AppLayout>
  );
}