import {
  ChevronDown,
  X,
  FolderKanban,
  CheckSquare,
  Users,
  ListTodo,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

import { getProjects } from "../api/projectApi";
import { getTasks } from "../api/taskApi";
import { getUsers } from "../api/userApi";

import type { Project } from "../types/project";
import type { Task } from "../types/task";
import type { User } from "../types/auth";

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [descriptionModal, setDescriptionModal] =
    useState<{
      title: string;
      description: string;
    } | null>(null);

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true);

        const [
          projectsData,
          tasksData,
          usersData,
        ] = await Promise.all([
          getProjects(),
          getTasks(),
          getUsers(),
        ]);

        setProjects(projectsData);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    function handleFocus() {
      loadDashboard();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadDashboard]);

  useEffect(() => {
    if (
      selectedProject ||
      selectedTask ||
      descriptionModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    selectedProject,
    selectedTask,
    descriptionModal,
  ]);

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const myTasks = tasks.filter(
    (task) =>
      task.assigneeId === user?.id
  );

  function getProjectCreator(
    project: Project
  ): User | undefined {
    return users.find(
      (item) =>
        item.id === project.createdById
    );
  }

  function getTaskProject(
    task: Task
  ): Project | undefined {
    return projects.find(
      (project) =>
        project.id === task.projectId
    );
  }

  function getTaskAssignee(
    task: Task
  ): User | undefined {
    if (!task.assigneeId) {
      return undefined;
    }

    return users.find(
      (item) =>
        item.id === task.assigneeId
    );
  }

  function closeDetailsModal() {
    setSelectedProject(null);
    setSelectedTask(null);
  }

  function closeDescriptionModal() {
    setDescriptionModal(null);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name}. Here's what's
            happening with your workspace.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Team Members"
            value={
              loading
                ? "..."
                : String(users.length)
            }
            icon={Users}
          />

          <StatCard
            title="Projects"
            value={
              loading
                ? "..."
                : String(projects.length)
            }
            icon={FolderKanban}
          />

          <StatCard
            title="Tasks"
            value={
              loading
                ? "..."
                : String(tasks.length)
            }
            icon={CheckSquare}
          />

          <StatCard
            title="My Tasks"
            value={
              loading
                ? "..."
                : String(myTasks.length)
            }
            icon={ListTodo}
          />

        </div>

        {/* Recent Projects + Recent Tasks */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Recent Projects */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Projects
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest projects
              </p>
            </div>

            <div className="mt-6">

              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading projects...
                </div>
              ) : recentProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Create your first project to get started."
                />
              ) : (
                <div className="space-y-3">

                  {recentProjects.map(
                    (project) => (
                      <div
                        key={project.id}
                        className="flex min-h-[130px] items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:shadow-sm"
                      >

                        {/* Project Icon */}
                        <div className="shrink-0 rounded-lg bg-gray-100 p-2">
                          <FolderKanban
                            size={18}
                            className="text-gray-700"
                          />
                        </div>

                        {/* Project Content */}
                        <div className="min-w-0 flex-1">

                          <h3 className="truncate font-medium text-gray-900">
                            {project.name}
                          </h3>

                          <div className="mt-2">
                            <DescriptionPreview
                              title="project"
                              description={
                                project.description
                              }
                              onExpand={() =>
                                setDescriptionModal({
                                  title:
                                    project.name,
                                  description:
                                    project.description ||
                                    "No description",
                                })
                              }
                            />
                          </div>

                          {/* Created At */}
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Created{" "}
                            {formatDate(
                              project.createdAt
                            )}
                          </p>

                        </div>

                        {/* Details Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProject(
                              project
                            )
                          }
                          className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                          aria-label="View project details"
                          title="View details"
                        >
                          <ChevronDown
                            size={18}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </section>

          {/* Recent Tasks */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Tasks
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest tasks
              </p>
            </div>

            <div className="mt-6">

              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading tasks...
                </div>
              ) : recentTasks.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks yet"
                  description="Tasks from your projects will appear here."
                />
              ) : (
                <div className="space-y-3">

                  {recentTasks.map(
                    (task) => {
                      const project =
                        getTaskProject(
                          task
                        );

                      return (
                        <div
                          key={task.id}
                          className="flex min-h-[130px] items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:shadow-sm"
                        >

                          {/* Task Icon */}
                          <div className="shrink-0 rounded-lg bg-gray-100 p-2">
                            <CheckSquare
                              size={18}
                              className="text-gray-700"
                            />
                          </div>

                          {/* Task Content */}
                          <div className="min-w-0 flex-1">

                            <h3 className="truncate font-medium text-gray-900">
                              {task.title}
                            </h3>

                            {/* Project */}
                            <p className="mt-1 truncate text-xs font-medium text-gray-500">
                              {project?.name ||
                                "No project"}
                            </p>

                            {/* Description */}
                            <div className="mt-2">
                              <DescriptionPreview
                                title="task"
                                description={
                                  task.description
                                }
                                onExpand={() =>
                                  setDescriptionModal({
                                    title:
                                      task.title,
                                    description:
                                      task.description ||
                                      "No description",
                                  })
                                }
                              />
                            </div>

                            {/* Status + Priority */}
                            <div className="mt-1 flex flex-wrap items-center gap-2">

                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {formatStatus(
                                  task.status
                                )}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>

                            </div>

                          </div>

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTask(
                                task
                              )
                            }
                            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            aria-label="View task details"
                            title="View details"
                          >
                            <ChevronDown
                              size={18}
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </section>

        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          creator={getProjectCreator(
            selectedProject
          )}
          onClose={
            closeDetailsModal
          }
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          project={getTaskProject(
            selectedTask
          )}
          assignee={getTaskAssignee(
            selectedTask
          )}
          onClose={
            closeDetailsModal
          }
        />
      )}

      {/* Full Description Modal */}
      {descriptionModal && (
        <DescriptionModal
          title={descriptionModal.title}
          description={
            descriptionModal.description
          }
          onClose={
            closeDescriptionModal
          }
        />
      )}

    </AppLayout>
  );
}

/* =========================================================
   DESCRIPTION PREVIEW
========================================================= */

function DescriptionPreview({
  title,
  description,
  onExpand,
}: {
  title: string;
  description?: string | null;
  onExpand: () => void;
}) {
  const descriptionRef =
    useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] =
    useState(false);

  useEffect(() => {
    const element =
      descriptionRef.current;

    if (!element) {
      return;
    }

    function checkOverflow() {
      setIsOverflowing(
	Boolean(
          element &&
	  element.scrollHeight >
            element.clientHeight
	)
      );
    }

    checkOverflow();

    window.addEventListener(
      "resize",
      checkOverflow
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkOverflow
      );
    };
  }, [description]);

  if (!description) {
    return (
      <div className="max-h-12 overflow-hidden">
        <p className="text-sm italic text-gray-400">
          No description
        </p>
      </div>
    );
  }

  return (
    <div className="relative">

      <div
        ref={descriptionRef}
        className="max-h-12 overflow-hidden pr-8"
      >
        <p className="text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={onExpand}
          className="absolute bottom-0 right-0 rounded-md bg-white p-1 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
          aria-label={`View full ${title} description`}
          title="View full description"
        >
          <ChevronDown size={17} />
        </button>
      )}

    </div>
  );
}

/* =========================================================
   PROJECT DETAILS MODAL
========================================================= */

function ProjectDetailsModal({
  project,
  creator,
  onClose,
}: {
  project: Project;
  creator?: User;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="shrink-0 rounded-lg bg-gray-100 p-2">
              <FolderKanban
                size={20}
                className="text-gray-700"
              />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Project Details
              </p>

              <h2 className="truncate text-lg font-semibold text-gray-900">
                {project.name}
              </h2>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close project details"
          >
            <X size={20} />
          </button>

        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-6">

          <div className="space-y-6">

            <DetailItem label="Project Name">
              <p className="text-sm font-medium text-gray-900">
                {project.name}
              </p>
            </DetailItem>

            <DetailItem label="Description">
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                  {project.description ||
                    "No description"}
                </p>
              </div>
            </DetailItem>

            <DetailItem label="Created By">
              {creator ? (
                <div className="flex items-center gap-3">

                  <UserAvatar
                    name={creator.name}
                  />

                  <div>

                    <p className="text-sm font-medium text-gray-900">
                      {creator.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {creator.role.replaceAll(
                        "_",
                        " "
                      )}
                    </p>

                  </div>

                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Unknown user
                </p>
              )}
            </DetailItem>

            <DetailItem label="Team">
              <p className="text-sm text-gray-700">
                {project.teamId ||
                  "No team assigned"}
              </p>
            </DetailItem>

            <DetailItem label="Created At">
              <p className="text-sm text-gray-700">
                {formatDateTime(
                  project.createdAt
                )}
              </p>
            </DetailItem>

            {hasBeenUpdated(
              project.createdAt,
              project.updatedAt
            ) && (
              <DetailItem label="Last Updated">
                <p className="text-sm text-gray-700">
                  {formatDateTime(
                    project.updatedAt
                  )}
                </p>
              </DetailItem>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   TASK DETAILS MODAL
========================================================= */

function TaskDetailsModal({
  task,
  project,
  assignee,
  onClose,
}: {
  task: Task;
  project?: Project;
  assignee?: User;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="shrink-0 rounded-lg bg-gray-100 p-2">
              <CheckSquare
                size={20}
                className="text-gray-700"
              />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Task Details
              </p>

              <h2 className="truncate text-lg font-semibold text-gray-900">
                {task.title}
              </h2>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close task details"
          >
            <X size={20} />
          </button>

        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-6">

          <div className="space-y-6">

            <DetailItem label="Task Name">
              <p className="text-sm font-medium text-gray-900">
                {task.title}
              </p>
            </DetailItem>

            <DetailItem label="Project">
              <p className="text-sm font-medium text-gray-700">
                {project?.name ||
                  "No project"}
              </p>
            </DetailItem>

            <DetailItem label="Description">
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                  {task.description ||
                    "No description"}
                </p>
              </div>
            </DetailItem>

            <DetailItem label="Assignee">
              {assignee ? (
                <div className="flex items-center gap-3">

                  <UserAvatar
                    name={assignee.name}
                  />

                  <div>

                    <p className="text-sm font-medium text-gray-900">
                      {assignee.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {assignee.role.replaceAll(
                        "_",
                        " "
                      )}
                    </p>

                  </div>

                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Unassigned
                </p>
              )}
            </DetailItem>

            <DetailItem label="Status">
              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {formatStatus(
                  task.status
                )}
              </span>
            </DetailItem>

            <DetailItem label="Priority">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </DetailItem>

            <DetailItem label="Due Date">
              <p className="text-sm text-gray-700">
                {task.dueDate
                  ? formatDateTime(
                      task.dueDate
                    )
                  : "No due date"}
              </p>
            </DetailItem>

            <DetailItem label="Created At">
              <p className="text-sm text-gray-700">
                {formatDateTime(
                  task.createdAt
                )}
              </p>
            </DetailItem>

            {hasBeenUpdated(
              task.createdAt,
              task.updatedAt
            ) && (
              <DetailItem label="Last Updated">
                <p className="text-sm text-gray-700">
                  {formatDateTime(
                    task.updatedAt
                  )}
                </p>
              </DetailItem>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   FULL DESCRIPTION MODAL
========================================================= */

function DescriptionModal({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Full Description
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-gray-900">
              {title}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close full description"
          >
            <X size={20} />
          </button>

        </div>

        {/* Description */}
        <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-6 py-6">

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
              {description}
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   USER AVATAR
========================================================= */

function UserAvatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .split(" ")
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      {children}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  title: string;
  value: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div className="rounded-lg bg-gray-100 p-3">

          <Icon
            size={21}
            className="text-gray-700"
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">

      <Icon
        size={32}
        className="mx-auto text-gray-400"
      />

      <p className="mt-3 text-sm font-medium text-gray-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   PRIORITY COLORS
========================================================= */

function getPriorityClasses(
  priority: string
) {
  switch (priority) {
    case "LOW":
      return "bg-green-100 text-green-700";

    case "MEDIUM":
      return "bg-orange-100 text-orange-700";

    case "HIGH":
      return "bg-blue-100 text-blue-700";

    case "URGENT":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

/* =========================================================
   STATUS FORMATTER
========================================================= */

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   UPDATED CHECK
========================================================= */

function hasBeenUpdated(
  createdAt: string,
  updatedAt: string
) {
  return (
    new Date(updatedAt).getTime() >
    new Date(createdAt).getTime() + 1000
  );
}

/* =========================================================
   DATE FORMATTERS
========================================================= */

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString();
}

function formatDateTime(
  date: string
) {
  return new Date(
    date
  ).toLocaleString();
}