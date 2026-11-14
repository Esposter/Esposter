import type { SchedulerObject } from "@esposter/db-schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import { todoReminderContentSchema } from "#src/models/todoReminder/TodoReminderContent";
import { getContentBlobName } from "@esposter/db";
import { getTodoReminderId, QueueJob, ResourceType, resourcesInResource } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// Schedules a reminder for every incomplete TodoList item with a due date, on the item's own Scheduler object, the way the app
// schedules one when the item is saved. A due date that passed while the estate was frozen is due now. The content is read from
// the bucket the copy wrote, under the blob name the app reads it by. A resource never saved has no content and no reminder
export const rescheduleTodoReminders = async (
  database: DrizzleD1Database,
  bucket: R2Bucket,
  schedulerNamespace: DurableObjectNamespace<SchedulerObject>,
  now: number,
): Promise<number> => {
  const resources = await database
    .select({ id: resourcesInResource.id })
    .from(resourcesInResource)
    .where(and(eq(resourcesInResource.type, ResourceType.TodoList), isNull(resourcesInResource.deletedAt)));
  const scheduledCounts = await Promise.all(
    resources.map(async ({ id: resourceId }) => {
      const object = await bucket.get(getContentBlobName(resourceId));
      if (!object) return 0;
      // oxlint-disable-next-line no-restricted-properties -- todoReminderContentSchema coerces dueAt itself
      const { items } = todoReminderContentSchema.parse(JSON.parse(await object.text()));
      const reminders = items.flatMap(({ completedAt, dueAt, id: itemId }) =>
        completedAt || !dueAt ? [] : [{ dueAt, itemId }],
      );
      await Promise.all(
        reminders.map(({ dueAt, itemId }) =>
          schedulerNamespace
            .get(schedulerNamespace.idFromName(getTodoReminderId(resourceId, itemId)))
            .schedule(Math.max(dueAt.getTime(), now), {
              payload: { dueAt, itemId, resourceId },
              queueJob: QueueJob.SendTodoReminder,
            }),
        ),
      );
      return reminders.length;
    }),
  );
  return scheduledCounts.reduce((total, count) => total + count, 0);
};
