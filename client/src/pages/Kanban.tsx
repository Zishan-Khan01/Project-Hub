import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Columns3,
  ListTodo,
  Trash2,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import KanbanBoard from "../components/kanban/KanbanBoard";

import {
  getTasks,
  updateTask,
  deleteTask,
} from "../api/taskApi";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/task";

export default function Kanban() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================================
     EDIT STATE
  ========================================================= */

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editStatus, setEditStatus] =
    useState<TaskStatus>("TODO");

  const [editPriority, setEditPriority] =
    useState<TaskPriority>("MEDIUM");

  const [editDueDate, setEditDueDate] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* =========================================================
     DELETE STATE
  ========================================================= */

  const [deletingTask, setDeletingTask] =
    useState<Task | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /* =========================================================
     LOAD TASKS
  ========================================================= */

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }

    async function loadTasks() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTasks();

        setTasks(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load tasks"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [projectId]);

  /* =========================================================
     MODAL BODY SCROLL LOCK
  ========================================================= */

  useEffect(() => {
    if (
      editingTask ||
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
    editingTask,
    deletingTask,
  ]);

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function handleStatusChange(
    taskId: string,
    status: TaskStatus
  ) {
    try {
      setError("");

      const updatedTask =
        await updateTask(taskId, {
          status,
        });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task status"
      );
    }
  }

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  function handleEdit(task: Task) {
    setEditingTask(task);

    setEditTitle(task.title);

    setEditDescription(
      task.description ?? ""
    );

    setEditStatus(task.status);

    setEditPriority(task.priority);

    setEditDueDate(
      task.dueDate
        ? task.dueDate.slice(0, 10)
        : ""
    );

    setError("");
  }

  /* =========================================================
     CLOSE EDIT MODAL
  ========================================================= */

  function closeEditModal() {
    if (saving) {
      return;
    }

    setEditingTask(null);
    setError("");
  }

  /* =========================================================
     SAVE EDIT
  ========================================================= */

  async function handleSaveEdit() {
    if (!editingTask) {
      return;
    }

    if (!editTitle.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedTask =
        await updateTask(
          editingTask.id,
          {
            title: editTitle.trim(),

            description:
              editDescription.trim() ||
              undefined,

            status: editStatus,

            priority: editPriority,

            dueDate:
              editDueDate || undefined,

            assigneeId:
              editingTask.assigneeId ??
              undefined,
          }
        );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task
        )
      );

      setEditingTask(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     OPEN DELETE MODAL
  ========================================================= */

  function handleDelete(task: Task) {
    setDeletingTask(task);
    setError("");
  }

  /* =========================================================
     CONFIRM DELETE
  ========================================================= */

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

      setDeletingTask(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task"
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-2">

              <div className="rounded-lg bg-gray-100 p-2">
                <Columns3
                  size={21}
                  className="text-gray-700"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Kanban Board
              </h1>

              {!loading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {tasks.length}
                </span>
              )}

            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage project tasks by status.
            </p>
          </div>

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

        {/* Board */}
        {loading ? (
          <LoadingState />
        ) : tasks.length === 0 ? (
          <EmptyTasks />
        ) : (
          <div className="mt-6">
            <KanbanBoard
              tasks={tasks}
              onStatusChange={
                handleStatusChange
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

      </div>

      {/* =====================================================
          EDIT TASK MODAL
      ===================================================== */}

      {editingTask && (
        <EditTaskModal
          title={editTitle}
          description={editDescription}
          status={editStatus}
          priority={editPriority}
          dueDate={editDueDate}
          saving={saving}
          onTitleChange={setEditTitle}
          onDescriptionChange={
            setEditDescription
          }
          onStatusChange={setEditStatus}
          onPriorityChange={
            setEditPriority
          }
          onDueDateChange={
            setEditDueDate
          }
          onSave={handleSaveEdit}
          onClose={closeEditModal}
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deletingTask && (
        <DeleteTaskModal
          task={deletingTask}
          deleting={deleting}
          onConfirm={confirmDelete}
          onClose={() =>
            deleting
              ? undefined
              : setDeletingTask(null)
          }
        />
      )}

    </AppLayout>
  );
}

/* =========================================================
   EDIT TASK MODAL
========================================================= */

function EditTaskModal({
  title,
  description,
  status,
  priority,
  dueDate,
  saving,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onSave,
  onClose,
}: {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  saving: boolean;

  onTitleChange: (
    value: string
  ) => void;

  onDescriptionChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: TaskStatus
  ) => void;

  onPriorityChange: (
    value: TaskPriority
  ) => void;

  onDueDateChange: (
    value: string
  ) => void;

  onSave: () => void;

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
              Task
            </p>

            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              Edit Task
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close edit task"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}
        <div className="px-6 py-6">

          <div className="space-y-5">

            {/* Title */}
            <div>

              <label
                htmlFor="kanban-edit-task-title"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Task title
              </label>

              <input
                id="kanban-edit-task-title"
                type="text"
                value={title}
                onChange={(event) =>
                  onTitleChange(
                    event.target.value
                  )
                }
                disabled={saving}
                maxLength={150}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              />

            </div>

            {/* Description */}
            <div>

              <label
                htmlFor="kanban-edit-task-description"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="kanban-edit-task-description"
                value={description}
                onChange={(event) =>
                  onDescriptionChange(
                    event.target.value
                  )
                }
                disabled={saving}
                maxLength={1000}
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              />

              <p className="mt-1.5 text-right text-xs text-gray-400">
                {description.length}/1000
              </p>

            </div>

            {/* Status + Priority */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="kanban-edit-task-status"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="kanban-edit-task-status"
                  value={status}
                  onChange={(event) =>
                    onStatusChange(
                      event.target.value as TaskStatus
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
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

                <label
                  htmlFor="kanban-edit-task-priority"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>

                <select
                  id="kanban-edit-task-priority"
                  value={priority}
                  onChange={(event) =>
                    onPriorityChange(
                      event.target.value as TaskPriority
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
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

            {/* Due Date */}
            <div>

              <label
                htmlFor="kanban-edit-task-due-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Due date
              </label>

              <input
                id="kanban-edit-task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  onDueDateChange(
                    event.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
              />

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
              type="button"
              onClick={onSave}
              disabled={
                saving ||
                !title.trim()
              }
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </div>
    </div>
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

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyTasks() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
        <ListTodo
          size={27}
          className="text-gray-500"
        />
      </div>

      <h2 className="mt-5 font-semibold text-gray-900">
        No tasks yet
      </h2>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
        Create tasks from the Tasks page
        to start using this Kanban board.
      </p>

    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="min-h-[520px] animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4"
          >

            <div className="flex items-center justify-between">

              <div className="h-4 w-24 rounded bg-gray-200" />

              <div className="h-6 w-8 rounded-full bg-gray-200" />

            </div>

            <div className="mt-4 space-y-3">

              <div className="h-32 rounded-lg bg-gray-200" />

              <div className="h-32 rounded-lg bg-gray-200" />

            </div>

          </div>
        )
      )}

    </div>
  );
}