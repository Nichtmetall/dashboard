"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";

import { addTaskAction, toggleTaskAction } from "@/app/actions/tasks";
import type { TaskItem } from "@/lib/google/types";
import { formatRelativeDay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function TasksList({
  initialTasks,
  listId,
}: {
  initialTasks: TaskItem[];
  listId: string;
}) {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);
  const [newTitle, setNewTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Re-sync local state when the server provides fresh data (e.g. after a
  // `revalidatePath`). This render-phase reset is the React-recommended pattern
  // for adjusting state when a prop changes.
  const [syncedFrom, setSyncedFrom] = React.useState(initialTasks);
  if (syncedFrom !== initialTasks) {
    setSyncedFrom(initialTasks);
    setTasks(initialTasks);
  }

  function handleToggle(task: TaskItem, completed: boolean) {
    setBusyId(task.id);
    setError(null);
    // Optimistic update.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed } : t)),
    );
    startTransition(async () => {
      const res = await toggleTaskAction({
        listId: task.listId,
        taskId: task.id,
        completed,
      });
      if (!res.ok) {
        setError(res.error);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: !completed } : t,
          ),
        );
      }
      setBusyId(null);
    });
  }

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setError(null);
    setNewTitle("");

    startTransition(async () => {
      const res = await addTaskAction({ title, listId });
      if (res.ok) {
        setTasks((prev) => [res.data, ...prev]);
      } else {
        setError(res.error);
        setNewTitle(title);
      }
    });
  }

  const sorted = [...tasks].sort((a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1,
  );

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task title"
        />
        <Button type="submit" size="icon" disabled={isPending || !newTitle.trim()}>
          {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          <span className="sr-only">Add task</span>
        </Button>
      </form>

      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : null}

      <ScrollArea className="h-60 pr-3">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No tasks yet. Add your first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sorted.map((task) => (
              <li
                key={task.id}
                className="hover:bg-accent/50 flex items-start gap-3 rounded-md p-2"
              >
                <Checkbox
                  checked={task.completed}
                  disabled={busyId === task.id}
                  onCheckedChange={(checked) =>
                    handleToggle(task, checked === true)
                  }
                  className="mt-0.5"
                  aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      task.completed &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.due ? (
                    <p className="text-muted-foreground text-xs">
                      Due {formatRelativeDay(task.due)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
