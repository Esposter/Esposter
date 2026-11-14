import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { useScheduler } from "#server/composables/scheduler/useScheduler";
import { getTodoReminderId } from "#server/services/resource/todoList/getTodoReminderId";
import { QueueJob } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Schedules one reminder per item whose due date is new or changed since the last Save and still in the future, on
// The item's own Scheduler object, so a re-dated item replaces its alarm rather than adding one. Diffing keeps repeated
// Saves from rewriting the alarm for an unchanged due date. A reminder that no longer stands — its due date moved to
// The past, was cleared, completed or removed — has its alarm cleared. A completed item needs no reminder, so reopening
// It schedules one for the date it was given while completed. The diff only sees the immediately-previous save
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
    const currentDueAtMap = new Map(
      content.items.flatMap(({ completedAt, dueAt, id }) => (!completedAt && dueAt ? [[id, dueAt.getTime()]] : [])),
    );
    const now = Date.now();
    const reminders = content.items.flatMap(({ completedAt, dueAt, id }) => {
      if (completedAt || !dueAt || dueAt.getTime() <= now || previousDueAtMap.get(id) === dueAt.getTime()) return [];
      else return [{ dueAt, itemId: id, resourceId }];
    });
    // A rescheduled item's alarm is replaced below, so only the reminders that stop standing are cleared here
    const rescheduledItemIds = new Set(reminders.map(({ itemId }) => itemId));
    const cancelledItemIds = [...previousDueAtMap.keys()].filter(
      (itemId) =>
        currentDueAtMap.get(itemId) !== previousDueAtMap.get(itemId) && !rescheduledItemIds.has(itemId),
    );

    await Promise.all([
      ...cancelledItemIds.map((itemId) => useScheduler(getTodoReminderId(resourceId, itemId)).cancel()),
      ...reminders.map(({ dueAt, itemId }) =>
        useScheduler(getTodoReminderId(resourceId, itemId)).schedule(dueAt.getTime(), {
          payload: { dueAt, itemId, resourceId },
          queueJob: QueueJob.SendTodoReminder,
        }),
      ),
    ]);
  }).match(noop, console.error);
