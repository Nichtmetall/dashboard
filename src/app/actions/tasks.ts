"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createTask, setTaskCompletion } from "@/lib/google/tasks";
import type { TaskItem, WidgetResult } from "@/lib/google/types";

/** Server Action: add a new task to the user's default task list. */
export async function addTaskAction(
  input: { title: string; due?: string; listId?: string },
): Promise<WidgetResult<TaskItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You are not signed in.", reason: "unauthenticated" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "A task title is required.", reason: "unknown" };
  }

  const result = await createTask(session.user.id, {
    title,
    due: input.due,
    listId: input.listId,
  });

  if (result.ok) revalidatePath("/");
  return result;
}

/** Server Action: mark a task complete / incomplete. */
export async function toggleTaskAction(input: {
  listId: string;
  taskId: string;
  completed: boolean;
}): Promise<WidgetResult<TaskItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You are not signed in.", reason: "unauthenticated" };
  }

  const result = await setTaskCompletion(session.user.id, input);
  if (result.ok) revalidatePath("/");
  return result;
}
