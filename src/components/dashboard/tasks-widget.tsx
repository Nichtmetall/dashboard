import { CheckSquare } from "lucide-react";

import { getTasks } from "@/lib/google/tasks";
import {
  WidgetError,
  WidgetShell,
} from "@/components/dashboard/widget-shell";
import { TasksList } from "@/components/dashboard/tasks-list";

export async function TasksWidget({ userId }: { userId: string }) {
  const result = await getTasks(userId);

  return (
    <WidgetShell title="Tasks" icon={CheckSquare}>
      {!result.ok ? (
        <WidgetError message={result.error} />
      ) : (
        <TasksList initialTasks={result.data.tasks} listId={result.data.listId} />
      )}
    </WidgetShell>
  );
}
