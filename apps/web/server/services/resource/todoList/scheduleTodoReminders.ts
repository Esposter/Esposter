import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { getResultAsync, noop } from "@esposter/shared";

// Gives the reminder of each item whose due date is new or changed since the last Save, and still in the future, to the
// Resource owner's User object, which replaces the item's row rather than adding one. Diffing keeps repeated saves from
// Rewriting the reminder for an unchanged due date. A reminder that no longer stands — its due date moved to the past,
// Was cleared, completed or removed — is cancelled. A completed item needs no reminder, so reopening it gives one for
// The date it was given while completed. The diff only sees the immediately-previous save
export const scheduleTodoReminders = (
  resource: Pick<ResourceInResource, "id" | "userId">,
  content: ToData<TodoListResource>,
  previousContent: ToData<TodoListResource> | undefined,
): Promise<void> =>
  getResultAsync(async () => {
    const previousDueAtMap = new Map(
      (previousContent?.items ?? []).flatMap(({ completedAt, dueAt, id }) =>
        !completedAt && dueAt ? [[id, dueAt.getTime()]] : [],
      ),
    );
    const currentDueAtMap = new Map(
      content.items.flatMap(({ completedAt, dueAt, id }) => (!completedAt && dueAt ? [[id, dueAt.getTime()]] : [])),
    );
    const now = Date.now();
    const reminders = content.items.flatMap(({ completedAt, dueAt, id }) => {
      if (completedAt || !dueAt || dueAt.getTime() <= now || previousDueAtMap.get(id) === dueAt.getTime()) return [];
      else return [{ dueAt, itemId: id, resourceId: resource.id }];
    });
    // A rescheduled item's row is replaced by the reconcile, so only the reminders that stop standing are cancelled here
    const rescheduledItemIds = new Set(reminders.map(({ itemId }) => itemId));
    const cancelledItemIds = [...previousDueAtMap.keys()].filter(
      (itemId) => currentDueAtMap.get(itemId) !== previousDueAtMap.get(itemId) && !rescheduledItemIds.has(itemId),
    );
    if (reminders.length === 0 && cancelledItemIds.length === 0) return;

    await useUserObject(resource.userId).reconcileTodoReminders({
      cancelledItemIds,
      reminders,
      resourceId: resource.id,
    });
  }).match(noop, console.error);
