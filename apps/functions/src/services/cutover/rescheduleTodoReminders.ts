import type { DrizzleD1Database } from "drizzle-orm/d1";

import { todoReminderContentSchema } from "#src/models/todoReminder/TodoReminderContent";
import { getContentBlobName } from "@esposter/db";
import { resourcesInResource, ResourceType } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// Gives every incomplete TodoList item with a due date a reminder on its owner's User object.
// The app does the same when the item is saved. A due date that passed while the estate was frozen is due now.
// The content is read from the bucket the copy wrote, under the blob name the app reads it by.
// A resource never saved has no content and no reminder
export const rescheduleTodoReminders = async (
  database: DrizzleD1Database,
  bucket: R2Bucket,
  userNamespace: Cloudflare.Env["USER"],
  now: number,
): Promise<number> => {
  const resources = await database
    .select({ id: resourcesInResource.id, userId: resourcesInResource.userId })
    .from(resourcesInResource)
    .where(and(eq(resourcesInResource.type, ResourceType.TodoList), isNull(resourcesInResource.deletedAt)));
  const scheduledCounts = await Promise.all(
    resources.map(async ({ id: resourceId, userId }) => {
      const object = await bucket.get(getContentBlobName(resourceId));
      if (!object) return 0;
      // oxlint-disable-next-line no-restricted-properties -- todoReminderContentSchema coerces dueAt itself
      const { items } = todoReminderContentSchema.parse(JSON.parse(await object.text()));
      const reminders = items.flatMap(({ completedAt, dueAt, id: itemId }) =>
        completedAt || !dueAt ? [] : [{ dueAt: new Date(Math.max(dueAt.getTime(), now)), itemId, resourceId }],
      );
      if (reminders.length > 0)
        await userNamespace
          .get(userNamespace.idFromName(userId))
          .reconcileTodoReminders({ cancelledItemIds: [], reminders, resourceId });
      return reminders.length;
    }),
  );
  return scheduledCounts.reduce((total, count) => total + count, 0);
};
