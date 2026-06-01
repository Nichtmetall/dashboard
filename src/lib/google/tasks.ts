import "server-only";

import { google } from "googleapis";

import { getGoogleClient } from "@/lib/google/client";
import { mapGoogleError } from "@/lib/google/errors";
import type { TaskItem, WidgetResult } from "@/lib/google/types";

/**
 * Fetch tasks from the user's default task list, including completed ones so
 * the UI can show recent progress.
 */
export async function getTasks(
  userId: string,
): Promise<WidgetResult<{ listId: string; tasks: TaskItem[] }>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const tasksApi = google.tasks({ version: "v1", auth });

    const listId = await getDefaultTaskListId(userId);

    const { data } = await tasksApi.tasks.list({
      tasklist: listId,
      showCompleted: true,
      showHidden: true,
      maxResults: 50,
    });

    const tasks: TaskItem[] = (data.items ?? [])
      .map((task) => ({
        id: task.id ?? crypto.randomUUID(),
        title: task.title?.trim() || "(Untitled task)",
        notes: task.notes ?? null,
        due: task.due ?? null,
        completed: task.status === "completed",
        listId,
      }))
      // Open tasks first, then by due date.
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.due && b.due) return a.due.localeCompare(b.due);
        if (a.due) return -1;
        if (b.due) return 1;
        return 0;
      });

    return { ok: true, data: { listId, tasks } };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}

/** Resolve the id of the user's default ("@default") task list. */
export async function getDefaultTaskListId(userId: string): Promise<string> {
  const { auth } = await getGoogleClient(userId);
  const tasksApi = google.tasks({ version: "v1", auth });
  const { data } = await tasksApi.tasklists.list({ maxResults: 1 });
  return data.items?.[0]?.id ?? "@default";
}

/** Create a new task in the given (or default) task list. */
export async function createTask(
  userId: string,
  input: { title: string; notes?: string; due?: string; listId?: string },
): Promise<WidgetResult<TaskItem>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const tasksApi = google.tasks({ version: "v1", auth });
    const listId = input.listId ?? (await getDefaultTaskListId(userId));

    const { data } = await tasksApi.tasks.insert({
      tasklist: listId,
      requestBody: {
        title: input.title,
        notes: input.notes,
        due: input.due,
      },
    });

    return {
      ok: true,
      data: {
        id: data.id ?? crypto.randomUUID(),
        title: data.title ?? input.title,
        notes: data.notes ?? null,
        due: data.due ?? null,
        completed: data.status === "completed",
        listId,
      },
    };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}

/** Toggle a task between completed and needsAction. */
export async function setTaskCompletion(
  userId: string,
  input: { listId: string; taskId: string; completed: boolean },
): Promise<WidgetResult<TaskItem>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const tasksApi = google.tasks({ version: "v1", auth });

    const { data } = await tasksApi.tasks.patch({
      tasklist: input.listId,
      task: input.taskId,
      requestBody: {
        status: input.completed ? "completed" : "needsAction",
        // Clearing completed timestamp is required when re-opening a task.
        completed: input.completed ? new Date().toISOString() : null,
      },
    });

    return {
      ok: true,
      data: {
        id: data.id ?? input.taskId,
        title: data.title ?? "",
        notes: data.notes ?? null,
        due: data.due ?? null,
        completed: data.status === "completed",
        listId: input.listId,
      },
    };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}
