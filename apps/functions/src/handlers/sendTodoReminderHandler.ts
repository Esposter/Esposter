import { todoReminderContentSchema } from "#src/models/todoReminder/TodoReminderContent";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { db } from "#src/services/shared/db";
import { getBucket } from "#src/services/storage/getBucket";
import { getContentBlobName, readJsonBlob } from "@esposter/db";
import {
  AppNotificationType,
  StorageBucket,
  QueueJob,
  publishNotification,
  ResourceType,
  todoReminderQueueMessageSchema,
} from "@esposter/db-schema";

export const sendTodoReminderHandler = async (message: unknown): Promise<void> => {
  const { dueAt, itemId, resourceId } = todoReminderQueueMessageSchema.parse(message);
  console.log(`${QueueJob.SendTodoReminder} dequeued reminder`, { itemId, resourceId });
  const resource = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: resourceId }, type: { eq: ResourceType.TodoList } },
  });
  if (!resource) {
    console.log(`${QueueJob.SendTodoReminder} skipped: resource gone`, { resourceId });
    return;
  }

  const bucket = getBucket(StorageBucket.ResourceAssets);
  // A missing content blob means nothing to remind about, so it drops the reminder while transient storage
  // Failures surface for a retry instead of being swallowed as "no content".
  const buffer = await readJsonBlob(bucket, getContentBlobName(resourceId));
  if (!buffer) {
    console.log(`${QueueJob.SendTodoReminder} skipped: no content`, { resourceId });
    return;
  }
  // oxlint-disable-next-line no-restricted-properties -- todoReminderContentSchema coerces dueAt itself
  const { items } = todoReminderContentSchema.parse(JSON.parse(buffer.toString()));
  const item = items.find(({ id }) => id === itemId);
  // The reminder fires against a save-time snapshot, so re-verify against the live blob: the item may
  // Have been deleted or re-dated (a re-dated item enqueued its own fresh reminder), or completed since the
  // Reminder was enqueued, any of which makes this stale reminder a silent no-op.
  if (item?.dueAt?.getTime() !== dueAt.getTime() || item?.completedAt) {
    console.log(`${QueueJob.SendTodoReminder} skipped: item deleted, re-dated or completed`, { itemId, resourceId });
    return;
  }

  await publishNotification(getJobQueue(QueueJob.ProcessNotification), {
    itemName: item.name,
    resourceId,
    type: AppNotificationType.TodoReminder,
    userId: resource.userId,
  });
};
