import { useState } from "react";

import {
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

import {
  updateComment,
  deleteComment,
} from "../../api/commentApi";

import type {
  Comment,
  UpdateCommentData,
} from "../../types/comment";

interface CommentItemProps {
  comment: Comment;

  currentUserId: string | null;

  onCommentUpdated: (
    comment: Comment
  ) => void;

  onCommentDeleted: (
    commentId: string
  ) => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  onCommentUpdated,
  onCommentDeleted,
}: CommentItemProps) {
  const [editing, setEditing] =
    useState(false);

  const [content, setContent] =
    useState(comment.content);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const isOwner =
    currentUserId === comment.userId;

  async function handleUpdate() {
    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data: UpdateCommentData = {
        content: trimmedContent,
      };

      const updatedComment =
        await updateComment(
          comment.id,
          data
        );

      onCommentUpdated(
        updatedComment
      );

      setEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update comment"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      setError("");

      await deleteComment(
        comment.id
      );

      onCommentDeleted(
        comment.id
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete comment"
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleCancelEdit() {
    setContent(comment.content);
    setError("");
    setEditing(false);
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
      {/* Header */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-gray-800">
            {comment.user?.name ??
              "Unknown user"}
          </p>

          <p className="mt-0.5 text-[11px] text-gray-400">
            {new Date(
              comment.createdAt
            ).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        {isOwner && !editing && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-white hover:text-gray-900"
              aria-label="Edit comment"
              title="Edit comment"
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Delete comment"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 min-w-0 break-words rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Edit */}
      {editing ? (
        <div className="mt-3 min-w-0">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            rows={3}
            disabled={saving}
            className="block w-full min-w-0 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={13} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={
                saving ||
                !content.trim()
              }
              className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={13} />

              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      ) : (
        /* Comment Content */
        <p className="mt-3 min-w-0 max-w-full break-words whitespace-pre-wrap text-sm leading-5 text-gray-700">
          {comment.content}
        </p>
      )}
    </div>
  );
}