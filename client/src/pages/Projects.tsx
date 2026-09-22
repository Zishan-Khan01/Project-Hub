import {
  ChevronDown,
  X,
  FolderKanban,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import {
  createProject,
  deleteProject,
  getProjects,
} from "../api/projectApi";

import type { Project } from "../types/project";

export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [descriptionModal, setDescriptionModal] =
    useState<{
      title: string;
      description: string;
    } | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const data = await getProjects();

        setProjects(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (
      projectToDelete ||
      selectedProject ||
      descriptionModal
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
    projectToDelete,
    selectedProject,
    descriptionModal,
  ]);

  async function handleCreate(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const project =
        await createProject({
          name: name.trim(),
          description:
            description.trim() ||
            undefined,
        });

      setProjects((current) => [
        project,
        ...current,
      ]);

      setName("");
      setDescription("");
      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!projectToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteProject(
        projectToDelete.id
      );

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !==
            projectToDelete.id
        )
      );

      setProjectToDelete(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project"
      );
    } finally {
      setDeleting(false);
    }
  }

  function closeCreateForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setName("");
    setDescription("");
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2">

              <div className="rounded-lg bg-gray-100 p-2">
                <FolderKanban
                  size={21}
                  className="text-gray-700"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Projects
              </h1>

              {!loading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {projects.length}
                </span>
              )}

            </div>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage your projects.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />
            New Project
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

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

        {/* Projects */}
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyProjects
            onCreate={() =>
              setShowForm(true)
            }
          />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {projects.map(
              (project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() =>
                    setProjectToDelete(
                      project
                    )
                  }
                  onDetails={() =>
                    setSelectedProject(
                      project
                    )
                  }
                  onExpandDescription={() =>
                    setDescriptionModal({
                      title:
                        project.name,
                      description:
                        project.description ||
                        "No description",
                    })
                  }
                />
              )
            )}

          </div>
        )}

      </div>

      {/* Create Project Modal */}
      {showForm && (
        <CreateProjectModal
          name={name}
          description={description}
          saving={saving}
          onNameChange={setName}
          onDescriptionChange={
            setDescription
          }
          onSubmit={handleCreate}
          onClose={closeCreateForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          project={projectToDelete}
          deleting={deleting}
          onConfirm={handleDelete}
          onClose={() =>
            deleting
              ? undefined
              : setProjectToDelete(null)
          }
        />
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() =>
            setSelectedProject(null)
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
          onClose={() =>
            setDescriptionModal(null)
          }
        />
      )}

    </AppLayout>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  onDelete,
  onDetails,
  onExpandDescription,
}: {
  project: Project;
  onDelete: () => void;
  onDetails: () => void;
  onExpandDescription: () => void;
}) {
  return (
    <div className="flex min-h-[175px] flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm">

      {/* Project Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="shrink-0 rounded-lg bg-gray-100 p-2.5">
            <FolderKanban
              size={20}
              className="text-gray-700"
            />
          </div>

          <h2 className="truncate font-semibold text-gray-900">
            {project.name}
          </h2>

        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          title="Delete project"
          aria-label={`Delete ${project.name}`}
        >
          <Trash2 size={18} />
        </button>

      </div>

      {/* Description + Arrow */}
      <div className="relative mt-2 pr-8">

        <DescriptionPreview
          title="project"
          description={
            project.description
          }
          onExpand={
            onExpandDescription
          }
        />

        {/* Details Arrow
            Directly below the delete button */}
        <button
          type="button"
          onClick={onDetails}
          className="absolute right-0 top-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="View project details"
          title="View details"
        >
          <ChevronDown size={18} />
        </button>

      </div>

      {/* Created At */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">

        <CalendarDays size={14} />

        <span>
          Created{" "}
          {formatDate(
            project.createdAt
          )}
        </span>

      </div>

      {/* Open Kanban */}
      <div className="mt-2">

        <Link
          to={`/projects/${project.id}/kanban`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <FolderKanban size={16} />
          Open Kanban
        </Link>

      </div>

    </div>
  );
}

/* =========================================================
   DESCRIPTION PREVIEW
   EXACT DASHBOARD OVERFLOW BEHAVIOR
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
        element.scrollHeight >
          element.clientHeight
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
        className="max-h-12 overflow-hidden"
      >
        <p className="text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>

      {/* Description expansion arrow */}
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
  onClose,
}: {
  project: Project;
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
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
   CREATE PROJECT MODAL
========================================================= */

function CreateProjectModal({
  name,
  description,
  saving,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onClose,
}: {
  name: string;
  description: string;
  saving: boolean;
  onNameChange: (
    value: string
  ) => void;
  onDescriptionChange: (
    value: string
  ) => void;
  onSubmit: (
    event: FormEvent
  ) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Workspace
            </p>

            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              Create Project
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close create project"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="px-6 py-6"
        >

          <div className="space-y-5">

            {/* Name */}
            <div>

              <label
                htmlFor="project-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(event) =>
                  onNameChange(
                    event.target.value
                  )
                }
                required
                maxLength={150}
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="Website Redesign"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Maximum 150 characters.
              </p>

            </div>

            {/* Description */}
            <div>

              <label
                htmlFor="project-description"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) =>
                  onDescriptionChange(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                placeholder="Describe your project..."
              />

              <p className="mt-1.5 text-right text-xs text-gray-400">
                {description.length}/1000
              </p>

            </div>

          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !name.trim()
              }
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Project"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

/* =========================================================
   DELETE PROJECT MODAL
========================================================= */

function DeleteProjectModal({
  project,
  deleting,
  onConfirm,
  onClose,
}: {
  project: Project;
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
          Delete project?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-700">
            {project.name}
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
              : "Delete Project"}
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyProjects({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
        <FolderKanban
          size={27}
          className="text-gray-500"
        />
      </div>

      <h2 className="mt-5 font-semibold text-gray-900">
        No projects yet
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
        Create your first project to
        start organizing your work.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        <Plus size={17} />
        New Project
      </button>

    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="min-h-[175px] animate-pulse rounded-xl border border-gray-200 bg-white p-5"
          >

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-lg bg-gray-100" />

              <div className="h-4 w-32 rounded bg-gray-100" />

            </div>

            <div className="mt-3 space-y-2">

              <div className="h-3 w-full rounded bg-gray-100" />

              <div className="h-3 w-5/6 rounded bg-gray-100" />

            </div>

            <div className="mt-2 h-3 w-28 rounded bg-gray-100" />

            <div className="mt-2 h-9 rounded-lg bg-gray-100" />

          </div>
        )
      )}

    </div>
  );
}

/* =========================================================
   HELPERS
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