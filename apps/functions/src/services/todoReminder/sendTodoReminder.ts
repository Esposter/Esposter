import type { TodoReminder } from "@esposter/db-schema";

import { todoReminderContentSchema } from "#src/models/todoReminder/TodoReminderContent";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { db } from "#src/services/shared/db";
import { getBucket } from "#src/services/storage/getBucket";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import { AppNotificationType, publishNotification, QueueJob, ResourceType, StorageBucket } from "@esposter/db-schema";

// Sends one due reminder through the notification queue, unless the item it was set for no longer stands.
// A failure that is not a missing item throws, so the owning object keeps the reminder and retries it
export const sendTodoReminder = async ({ dueAt, itemId, resourceId }: TodoReminder): Promise<void> => {
  console.log(`${QueueJob.ProcessNotification} todo reminder due`, { itemId, resourceId });
  const resource = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: resourceId }, type: { eq: ResourceType.TodoList } },
  });
  if (!resource) {
    console.log("TodoReminder skipped: resource gone", { resourceId });
    return;
  }

  const bucket = getBucket(StorageBucket.ResourceAssets);
  // A missing content blob means nothing to remind about, so it drops the reminder while transient storage
  // Failures surface for a retry instead of being swallowed as "no content".
  const buffer = await readJsonBlob(bucket, getContentBlobName(resourceId));
  if (!buffer) {
    console.log("TodoReminder skipped: no content", { resourceId });
    return;
  }
  // oxlint-disable-next-line no-restricted-properties -- todoReminderContentSchema coerces dueAt itself
  const { items } = todoReminderContentSchema.parse(JSON.parse(buffer.toString()));
  const item = items.find(({ id }) => id === itemId);
  // The reminder fires against a save-time snapshot, so re-verify against the live blob: the item may
  // Have been deleted or re-dated (a re-dated item enqueued its own fresh reminder), or completed since the
  // Reminder was enqueued, any of which makes this stale reminder a silent no-op.
  if (item?.dueAt?.getTime() !== dueAt.getTime() || item?.completedAt) {
    console.log("TodoReminder skipped: item deleted, re-dated or completed", { itemId, resourceId });
    return;
  }

  await publishNotification(getJobQueue(QueueJob.ProcessNotification), {
    itemName: item.name,
    resourceId,
    type: AppNotificationType.TodoReminder,
    userId: resource.userId,
  });
};
