import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { Resource } from "@esposter/db-schema";

import { useServiceBusSender } from "@@/server/composables/azure/serviceBus/useServiceBusSender";
import { enqueueTodoReminder } from "@esposter/db";
import { AzureQueue } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Enqueues one scheduled Service Bus reminder per item whose due date is new or changed since the last
// Save and still in the future. A duplicate is harmless (the function re-verifies against the blob at
// Fire time), but diffing keeps repeated saves from piling reminders up for an unchanged due date.
export const scheduleTodoReminders = (
  resourceId: Resource["id"],
  content: TodoListResource,
  previousContent: TodoListResource | undefined,
): Promise<void> =>
  getResultAsync(async () => {
    const previousDueAtMap = new Map(
      (previousContent?.items ?? []).flatMap((item) => (item.dueAt ? [[item.id, item.dueAt.getTime()]] : [])),
    );
    const now = Date.now();
    const reminders = content.items.flatMap((item) => {
      const { dueAt } = item;
      if (!dueAt || dueAt.getTime() <= now || previousDueAtMap.get(item.id) === dueAt.getTime()) return [];
      return [{ dueAt, itemId: item.id, resourceId }];
    });
    if (reminders.length === 0) return;

    const serviceBusSender = useServiceBusSender(AzureQueue.TodoReminders);
    await Promise.all(reminders.map((reminder) => enqueueTodoReminder(serviceBusSender, reminder)));
  }).match(noop, console.error);
