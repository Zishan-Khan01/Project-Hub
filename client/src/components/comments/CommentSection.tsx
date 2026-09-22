import { useEffect, useState } from "react";

import {
  getCommentsByTask,
  createComment,
} from "../../api/commentApi";

import CommentItem from "./CommentItem";

import type { Comment } from "../../types/comment";

interface CommentSectionProps {
  taskId: string;
  currentUserId: string | null;
}

export default function CommentSection({
  taskId,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadComments() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getCommentsByTask(taskId);

      setComments(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load comments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [taskId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const newComment =
        await createComment({
          taskId,
          content: trimmedContent,
        });

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setContent("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add comment"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCommentUpdated(
    updatedComment: Comment
  ) {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === updatedComment.id
          ? updatedComment
          : comment
      )
    );
  }

  function handleCommentDeleted(
    commentId: string
  ) {
    setComments((currentComments) =>
      currentComments.filter(
        (comment) =>
          comment.id !== commentId
      )
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      {/* Add Comment */}
      <form
        onSubmit={handleSubmit}
        className="min-w-0 space-y-2"
      >
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Write a comment..."
          rows={2}
          disabled={submitting}
          className="block w-full min-w-0 resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              submitting ||
              !content.trim()
            }
            className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Adding..."
              : "Add Comment"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="min-w-0 break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Comments */}
      {loading ? (
        <p className="py-2 text-xs text-gray-400">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="py-2 text-xs italic text-gray-400">
          No comments yet.
        </p>
      ) : (
        <div className="min-w-0 space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="min-w-0 max-w-full overflow-hidden"
            >
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onCommentUpdated={
                  handleCommentUpdated
                }
                onCommentDeleted={
                  handleCommentDeleted
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}