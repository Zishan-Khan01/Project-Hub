import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { useMemo, useState } from "react";

import type {
  Task,
  TaskStatus,
} from "../../types/task";

import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];

  onStatusChange: (
    taskId: string,
    status: TaskStatus
  ) => Promise<void>;

  onEdit?: (task: Task) => void;

  onDelete?: (task: Task) => void;
}

const columns: {
  status: TaskStatus;
  title: string;
}[] = [
  {
    status: "TODO",
    title: "To Do",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
  },
  {
    status: "IN_REVIEW",
    title: "In Review",
  },
  {
    status: "DONE",
    title: "Done",
  },
];

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedTasks = useMemo(() => {
    return columns.reduce(
      (groups, column) => {
        groups[column.status] = tasks.filter(
          (task) =>
            task.status === column.status
        );

        return groups;
      },
      {} as Record<TaskStatus, Task[]>
    );
  }, [tasks]);

  function handleDragStart(
    event: DragStartEvent
  ) {
    const task = tasks.find(
      (item) => item.id === event.active.id
    );

    setActiveTask(task ?? null);
  }

  async function handleDragEnd(
    event: DragEndEvent
  ) {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const task = tasks.find(
      (item) => item.id === active.id
    );

    if (!task) {
      return;
    }

    const newStatus =
      over.id as TaskStatus;

    const validStatus = columns.some(
      (column) =>
        column.status === newStatus
    );

    if (!validStatus) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    await onStatusChange(
      task.id,
      newStatus
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Kanban Columns */}
      <div className="flex w-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={
              groupedTasks[column.status]
            }
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px]">
            <TaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}