import { useEffect, useRef, useState } from "react";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import {
  CalendarDays,
  ChevronDown,
  GripVertical,
  MessageSquare,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import type { Task } from "../../types/task";

import CommentSection from "../comments/CommentSection";

import { useAuth } from "../../context/AuthContext";

interface TaskCardProps {
  task: Task;

  onEdit?: (task: Task) => void;

  onDelete?: (task: Task) => void;
}

function getPriorityClasses(
  priority: Task["priority"]
) {
  switch (priority) {
    case "URGENT":
      return "bg-red-50 text-red-700";

    case "HIGH":
      return "bg-orange-50 text-orange-700";

    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700";

    case "LOW":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatStatus(
  status: Task["status"]
) {
  return status
    .replace("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
}

function DescriptionPreview({
  description,
  onExpand,
}: {
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

    if (!element || !description) {
      setIsOverflowing(false);
      return;
    }

    function checkOverflow() {
      const currentElement =
        descriptionRef.current;

      if (!currentElement) {
        return;
      }

      setIsOverflowing(
        currentElement.scrollHeight >
          currentElement.clientHeight
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
      <div className="mt-1.5">
        <p className="text-sm italic text-gray-400">
          No description
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-1.5">
      <div
        ref={descriptionRef}
        className="max-h-10 overflow-hidden pr-8"
      >
        <p className="text-sm leading-5 text-gray-500">
          {description}
        </p>
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={onExpand}
          className="absolute bottom-0 right-0 rounded-md bg-white p-1 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="View full task description"
          title="View full description"
        >
          <ChevronDown size={16} />
        </button>
      )}
    </div>
  );
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [showComments, setShowComments] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showCommentsModal, setShowCommentsModal] =
    useState(false);

  const { user } = useAuth();

  const commentsRef =
    useRef<HTMLDivElement>(null);

  const [commentsOverflowing, setCommentsOverflowing] =
    useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!showComments) {
      setCommentsOverflowing(false);
      return;
    }

    const element =
      commentsRef.current;

    if (!element) {
      return;
    }

    function checkCommentsOverflow() {
      const currentElement =
        commentsRef.current;

      if (!currentElement) {
        return;
      }

      setCommentsOverflowing(
        currentElement.scrollHeight >
          currentElement.clientHeight
      );
    }

    checkCommentsOverflow();

    window.addEventListener(
      "resize",
      checkCommentsOverflow
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkCommentsOverflow
      );
    };
  }, [showComments]);

  return (
    <>
      {/* Task Card */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition ${
          isDragging
            ? "opacity-50 shadow-lg"
            : "hover:border-gray-300 hover:shadow-md"
        }`}
      >
        {/* Task Header */}
        <div className="relative">
          {/* Drag Handle */}
          <button
            type="button"
            {...listeners}
            className="absolute right-0 top-0 cursor-grab rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
            aria-label="Drag task"
            title="Drag task"
          >
            <GripVertical size={17} />
          </button>

          <div className="min-w-0 pr-8">
            {/* Title */}
            <h3 className="font-medium leading-5 text-gray-900">
              {task.title}
            </h3>

            {/* Description */}
            <DescriptionPreview
              description={task.description}
              onExpand={() =>
                setShowDetails(true)
              }
            />
          </div>
        </div>

        {/* Comments + Priority + Due Date */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* Comments Button */}
          <button
            type="button"
            onClick={() =>
              setShowComments(
                (current) => !current
              )
            }
            className="flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquare size={15} />

            {showComments
              ? "Hide Comments"
              : "Comments"}
          </button>

          {/* Priority + Due Date */}
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                <CalendarDays size={13} />

                {new Date(
                  task.dueDate
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-2 border-t border-gray-100 pt-2">
            <div ref={commentsRef}>
              <CommentSection
                taskId={task.id}
                currentUserId={
                  user?.id ?? null
                }
              />
            </div>

            {/* Full Comments Arrow */}
            {commentsOverflowing && (
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowCommentsModal(true)
                  }
                  className="rounded-md bg-white p-1 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="View full comments"
                  title="View full comments"
                >
                  <ChevronDown size={17} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Edit + Delete */}
        {(onEdit || onDelete) && (
          <div className="mt-2 flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
            {onEdit && (
              <button
                type="button"
                onClick={() =>
                  onEdit(task)
                }
                className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Edit task"
                title="Edit task"
              >
                <Pencil size={15} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(task)
                }
                className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Delete task"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Task Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View the complete task information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(false)
                }
                className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
              {/* Title */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Title
                </p>

                <h3 className="mt-1 text-base font-semibold text-gray-900">
                  {task.title}
                </h3>
              </div>

              {/* Description */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Description
                </p>

                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  {task.description ? (
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-gray-400">
                      No description
                    </p>
                  )}
                </div>
              </div>

              {/* Other Information */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatStatus(
                      task.status
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Priority
                  </p>

                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Due Date
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                    <CalendarDays size={14} />

                    {task.dueDate
                      ? new Date(
                          task.dueDate
                        ).toLocaleDateString()
                      : "No due date"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(
                      task.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Comments
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Comments for {task.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCommentsModal(false)
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Comments */}
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <CommentSection
                taskId={task.id}
                currentUserId={
                  user?.id ?? null
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}