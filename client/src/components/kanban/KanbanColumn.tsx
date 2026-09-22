import { useDroppable } from "@dnd-kit/core";

import {
  CheckCircle2,
  Circle,
  Eye,
  LoaderCircle,
} from "lucide-react";

import type {
  Task,
  TaskStatus,
} from "../../types/task";

import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];

  onEdit?: (task: Task) => void;

  onDelete?: (task: Task) => void;
}

const columnIcons = {
  TODO: Circle,
  IN_PROGRESS: LoaderCircle,
  IN_REVIEW: Eye,
  DONE: CheckCircle2,
};

export default function KanbanColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
  });

  const Icon = columnIcons[status];

  return (
    <div
      className={`flex min-h-[520px] w-full min-w-[280px] flex-col rounded-xl border transition ${
        isOver
          ? "border-gray-400 bg-gray-100 shadow-sm"
          : "border-gray-200 bg-gray-50"
      }`}
    >

      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">

        <div className="flex items-center gap-2">

          <Icon
            size={17}
            className={`${
              status === "DONE"
                ? "text-gray-700"
                : "text-gray-500"
            }`}
          />

          <h2 className="text-sm font-semibold text-gray-800">
            {title}
          </h2>

        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-500 shadow-sm">
          {tasks.length}
        </span>

      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 p-3 transition ${
          isOver
            ? "bg-gray-100"
            : ""
        }`}
      >

        {tasks.length === 0 ? (
          <div
            className={`flex min-h-28 items-center justify-center rounded-lg border border-dashed text-xs transition ${
              isOver
                ? "border-gray-400 bg-white text-gray-500"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {isOver
              ? "Drop task here"
              : "Drop tasks here"}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}

      </div>

    </div>
  );
}