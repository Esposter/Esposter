import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { useServiceBusSender } from "#server/composables/azure/serviceBus/useServiceBusSender";
import { enqueueTodoReminder } from "@esposter/db";
import { AzureQueue } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Enqueues one scheduled Service Bus reminder per item whose due date is new or changed since the last
// Save and still in the future. Diffing keeps repeated saves from piling reminders up for an unchanged
// Due date, and a re-dated item's stale reminder no-ops at fire time against the blob. The diff only sees
// The immediately-previous save, so a due date toggled away and back re-enqueues for the same timestamp —
// An accepted duplicate (Basic tier has no duplicate detection) whose worst case is one extra push. A completed item
// Needs no reminder, so it enqueues none — and its due date counts as unscheduled, so reopening it enqueues one for a
// Date it was given while completed, at the price of that same duplicate when the date predates the completion.
export const scheduleTodoReminders = (
  resourceId: ResourceInResource["id"],
  content: ToData<TodoListResource>,
  previousContent: ToData<TodoListResource> | undefined,
): Promise<void> =>
  getResultAsync(async () => {
    const previousDueAtMap = new Map(
      (previousContent?.items ?? []).flatMap(({ completedAt, dueAt, id }) =>
        !completedAt && dueAt ? [[id, dueAt.getTime()]] : [],
      ),
    );
    const now = Date.now();
    const reminders = content.items.flatMap(({ completedAt, dueAt, id }) => {
      if (completedAt || !dueAt || dueAt.getTime() <= now || previousDueAtMap.get(id) === dueAt.getTime()) return [];
      else return [{ dueAt, itemId: id, resourceId }];
    });
    if (reminders.length === 0) return;

    const serviceBusSender = useServiceBusSender(AzureQueue.TodoReminders);
    await Promise.all(reminders.map((reminder) => enqueueTodoReminder(serviceBusSender, reminder)));
  }).match(noop, console.error);
