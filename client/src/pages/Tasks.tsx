import {
  CalendarDays,
  ChevronDown,
  FolderKanban,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import AppLayout from "../components/layout/AppLayout";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";

import { getProjects } from "../api/projectApi";
import { getUsers } from "../api/userApi";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/task";

import type { Project } from "../types/project";
import type { User } from "../types/auth";


function formatDate(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString();
}


function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return "To Do";

    case "IN_PROGRESS":
      return "In Progress";

    case "IN_REVIEW":
      return "In Review";

    case "DONE":
      return "Done";

    default:
      return status;
  }
}


function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case "LOW":
      return "Low";

    case "MEDIUM":
      return "Medium";

    case "HIGH":
      return "High";

    case "URGENT":
      return "Urgent";

    default:
      return priority;
  }
}


function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "LOW":
      return "bg-gray-100 text-gray-600";

    case "MEDIUM":
      return "bg-blue-100 text-blue-700";

    case "HIGH":
      return "bg-orange-100 text-orange-700";

    case "URGENT":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}


function getStatusClasses(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return "bg-gray-100 text-gray-600";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "IN_REVIEW":
      return "bg-yellow-100 text-yellow-700";

    case "DONE":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}


export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [saving, setSaving] = useState(false);

  /* =========================================================
     DELETE STATE
  ========================================================= */

  const [deletingTask, setDeletingTask] =
    useState<Task | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus>("TODO");

  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");

  const [dueDate, setDueDate] = useState("");

  const [projectId, setProjectId] = useState("");

  const [assigneeId, setAssigneeId] =
    useState("");


  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        tasksData,
        projectsData,
        usersData,
      ] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers(),
      ]);

      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     MODAL BODY SCROLL LOCK
  ========================================================= */

  useEffect(() => {
    if (
      showForm ||
      selectedTask ||
      deletingTask
    ) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    showForm,
    selectedTask,
    deletingTask,
  ]);


  /* =========================================================
     FORM
  ========================================================= */

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setDueDate("");
    setProjectId("");
    setAssigneeId("");
    setEditingTask(null);
    setFormError("");
  }


  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }


  function openEditForm(task: Task) {
    setEditingTask(task);

    setTitle(task.title);
    setDescription(task.description ?? "");

    setStatus(task.status);
    setPriority(task.priority);

    setDueDate(
      task.dueDate
        ? task.dueDate.slice(0, 10)
        : ""
    );

    setProjectId(task.projectId);
    setAssigneeId(task.assigneeId ?? "");

    setFormError("");
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
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter a task title");
      return;
    }

    if (!projectId) {
      setFormError("Please select a project");
      return;
    }

    try {
      setSaving(true);

      if (editingTask) {
        const updatedTask =
          await updateTask(
            editingTask.id,
            {
              title: title.trim(),

              description:
                description.trim(),

              status,

              priority,

              dueDate:
                dueDate || undefined,

              assigneeId:
                assigneeId || undefined,
            }
          );

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === updatedTask.id
              ? updatedTask
              : task
          )
        );

        if (
          selectedTask?.id ===
          updatedTask.id
        ) {
          setSelectedTask(updatedTask);
        }
      } else {
        const newTask =
          await createTask({
            title: title.trim(),

            description:
              description.trim(),

            status,

            priority,

            dueDate:
              dueDate || undefined,

            projectId,

            assigneeId:
              assigneeId || undefined,
          });

        setTasks((currentTasks) => [
          newTask,
          ...currentTasks,
        ]);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  }


  /* =========================================================
     DELETE
  ========================================================= */

  function handleDelete(task: Task) {
    setDeletingTask(task);
    setError("");
  }


  async function confirmDelete() {
    if (!deletingTask) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteTask(
        deletingTask.id
      );

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) =>
            task.id !==
            deletingTask.id
        )
      );

      if (
        selectedTask?.id ===
        deletingTask.id
      ) {
        setSelectedTask(null);
      }

      setDeletingTask(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task"
      );
    } finally {
      setDeleting(false);
    }
  }


  /* =========================================================
     PROJECT / USER HELPERS
  ========================================================= */

  function getProjectName(
    projectId: string
  ) {
    return (
      projects.find(
        (project) =>
          project.id === projectId
      )?.name ?? "Unknown project"
    );
  }


  function getUserName(
    userId?: string | null
  ) {
    if (!userId) {
      return "Unassigned";
    }

    return (
      users.find(
        (user) => user.id === userId
      )?.name ?? "Unknown user"
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <AppLayout>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <div className="flex items-center gap-2">

              <div className="rounded-lg bg-gray-100 p-2">
                <ListTodo
                  size={21}
                  className="text-gray-700"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Tasks
              </h1>

              {!loading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {tasks.length}
                </span>
              )}

            </div>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage your tasks.
            </p>

          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />
            New Task
          </button>

        </div>


        {/* PAGE ERROR */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0 rounded p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>

          </div>
        )}


        {/* TASKS TABLE */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">

          {loading ? (
            <div className="divide-y divide-gray-100">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse px-6 py-5"
                  >
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-1/4 rounded bg-gray-100" />
                  </div>
                )
              )}

            </div>
          ) : tasks.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <ListTodo
                  size={22}
                  className="text-gray-500"
                />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-gray-900">
                No tasks yet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create your first task to get started.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={17} />
                New Task
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Task
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Project
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Priority
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Assignee
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {tasks.map((task) => (

                    <tr
                      key={task.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">
                        <div className="max-w-xs">

                          <p className="truncate text-sm font-medium text-gray-900">
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {task.description}
                            </p>
                          )}

                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getProjectName(
                          task.projectId
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            task.status
                          )}`}
                        >
                          {getStatusLabel(
                            task.status
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                            task.priority
                          )}`}
                        >
                          {getPriorityLabel(
                            task.priority
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getUserName(
                          task.assigneeId
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {/* Details */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTask(
                                task
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            title="View task details"
                            aria-label="View task details"
                          >
                            <ChevronDown
                              size={17}
                            />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                task
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            title="Edit task"
                            aria-label="Edit task"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                task
                              )
                            }
                            disabled={deleting}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>


        {/* =====================================================
            CREATE / EDIT TASK MODAL
        ===================================================== */}

        {showForm && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeForm();
              }
            }}
          >

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingTask
                      ? "Edit Task"
                      : "New Task"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {editingTask
                      ? "Update the task details"
                      : "Create a new task for your project"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>

              </div>


              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-6 py-6"
              >

                {formError &&
                  formError !==
                    "Please select a project" && (

                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {formError}
                  </div>

                )}


                {/* Title */}
                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(
                        e.target.value
                      );
                      setFormError("");
                    }}
                    placeholder="Enter task title"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />

                </div>


                {/* Description */}
                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Enter task description"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />

                </div>


                {/* Project */}
                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Project
                  </label>

                  <select
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(
                        e.target.value
                      );

                      if (
                        e.target.value
                      ) {
                        setFormError("");
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 ${
                      formError ===
                        "Please select a project" &&
                      !projectId
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >

                    <option value="">
                      Select a project
                    </option>

                    {projects.map(
                      (project) => (

                        <option
                          key={
                            project.id
                          }
                          value={
                            project.id
                          }
                        >
                          {project.name}
                        </option>

                      )
                    )}

                  </select>


                  {formError ===
                    "Please select a project" &&
                    !projectId && (

                    <p className="mt-1.5 text-sm text-red-600">
                      Please select a project
                    </p>

                  )}

                </div>


                {/* Status + Priority */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target
                            .value as TaskStatus
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    >

                      <option value="TODO">
                        To Do
                      </option>

                      <option value="IN_PROGRESS">
                        In Progress
                      </option>

                      <option value="IN_REVIEW">
                        In Review
                      </option>

                      <option value="DONE">
                        Done
                      </option>

                    </select>

                  </div>


                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Priority
                    </label>

                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(
                          e.target
                            .value as TaskPriority
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    >

                      <option value="LOW">
                        Low
                      </option>

                      <option value="MEDIUM">
                        Medium
                      </option>

                      <option value="HIGH">
                        High
                      </option>

                      <option value="URGENT">
                        Urgent
                      </option>

                    </select>

                  </div>

                </div>


                {/* Assignee + Due Date */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Assignee
                    </label>

                    <select
                      value={assigneeId}
                      onChange={(e) =>
                        setAssigneeId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    >

                      <option value="">
                        Unassigned
                      </option>

                      {users.map(
                        (user) => (

                          <option
                            key={user.id}
                            value={user.id}
                          >
                            {user.name}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) =>
                        setDueDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    />

                  </div>

                </div>


                {/* Buttons */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingTask
                        ? "Update Task"
                        : "Create Task"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* =====================================================
            TASK DETAILS MODAL
        ===================================================== */}

        {selectedTask && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedTask(null);
              }
            }}
          >

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    Task Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    View complete task information
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTask(null)
                  }
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>

              </div>


              <div className="space-y-6 px-6 py-6">

                {/* Task */}
                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Task
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {selectedTask.title}
                  </p>

                </div>


                {/* Description */}
                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {selectedTask.description ||
                      "No description"}
                  </p>

                </div>


                {/* Project */}
                <div className="flex items-start gap-3">

                  <FolderKanban
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Project
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getProjectName(
                        selectedTask.projectId
                      )}
                    </p>

                  </div>

                </div>


                {/* Status + Priority */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        selectedTask.status
                      )}`}
                    >
                      {getStatusLabel(
                        selectedTask.status
                      )}
                    </span>

                  </div>


                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Priority
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                        selectedTask.priority
                      )}`}
                    >
                      {getPriorityLabel(
                        selectedTask.priority
                      )}
                    </span>

                  </div>

                </div>


                {/* Assignee */}
                <div className="flex items-start gap-3">

                  <UserRound
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Assignee
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {getUserName(
                        selectedTask.assigneeId
                      )}
                    </p>

                  </div>

                </div>


                {/* Due Date */}
                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Due Date
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        selectedTask.dueDate
                      )}
                    </p>

                  </div>

                </div>


                {/* Dates */}
                <div className="grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Created At
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        selectedTask.createdAt
                      )}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        selectedTask.updatedAt
                      )}
                    </p>

                  </div>

                </div>


                {/* Modal Actions */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      openEditForm(
                        selectedTask
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <Pencil size={16} />
                    Edit Task
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        selectedTask
                      )
                    }
                    disabled={deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Task
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          DELETE TASK CONFIRMATION MODAL
      ===================================================== */}

      {deletingTask && (
        <DeleteTaskModal
          task={deletingTask}
          deleting={deleting}
          onConfirm={confirmDelete}
          onClose={() => {
            if (!deleting) {
              setDeletingTask(null);
            }
          }}
        />
      )}

    </AppLayout>
  );
}


/* =========================================================
   DELETE TASK MODAL
========================================================= */

function DeleteTaskModal({
  task,
  deleting,
  onConfirm,
  onClose,
}: {
  task: Task;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onClose();
        }
      }}
    >

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
          <Trash2
            size={21}
            className="text-red-600"
          />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Delete task?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-700">
            {task.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete Task"}
          </button>

        </div>

      </div>

    </div>
  );
}