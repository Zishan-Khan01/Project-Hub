import { FormEvent, useState } from "react";
import { createComment } from "../../api/commentApi";

interface CommentFormProps {
  taskId: string;
  onCommentCreated: (comment: Awaited<ReturnType<typeof createComment>>) => void;
}

export default function CommentForm({
  taskId,
  onCommentCreated,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Comment cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const comment = await createComment({
        taskId,
        content: trimmedContent,
      });

      onCommentCreated(comment);
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add comment"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment..."
        rows={3}
        disabled={loading}
        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Posting..." : "Add Comment"}
      </button>
    </form>
  );
}