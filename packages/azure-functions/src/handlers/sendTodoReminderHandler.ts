import type { ServiceBusQueueHandler } from "@azure/functions";

import { todoReminderContentSchema } from "@/models/TodoReminderContent";
import { db } from "@/services/db";
import { getContainerClient } from "@/services/getContainerClient";
import { logAndRethrow } from "@/services/logAndRethrow";
import { sendTodoReminderNotification } from "@/services/sendTodoReminderNotification";
import { RestError } from "@azure/storage-blob";
import { getContentBlobName } from "@esposter/db";
import { AzureContainer, AzureFunction, ResourceType, todoReminderQueueMessageSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const sendTodoReminderHandler: ServiceBusQueueHandler = (message, context) =>
  getResultAsync(async () => {
    const { dueAt, itemId, resourceId } = todoReminderQueueMessageSchema.parse(message);
    context.log(`${AzureFunction.SendTodoReminder} dequeued reminder`, { itemId, resourceId });
    const resource = await db.query.resources.findFirst({
      where: { deletedAt: { isNull: true }, id: { eq: resourceId }, type: { eq: ResourceType.TodoList } },
    });
    if (!resource) {
      context.log(`${AzureFunction.SendTodoReminder} skipped: resource gone`, { resourceId });
      return;
    }

    const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
    const blockBlobClient = containerClient.getBlockBlobClient(getContentBlobName(resourceId));
    // A missing content blob means nothing to remind about, so a 404 drops the reminder while transient
    // Azure failures surface for a retry instead of being swallowed as "no content".
    const buffer = await getResultAsync(() => blockBlobClient.downloadToBuffer()).match(
      (response) => response,
      (error) => {
        if (error instanceof RestError && error.statusCode === 404) return undefined;
        throw error;
      },
    );
    if (!buffer) {
      context.log(`${AzureFunction.SendTodoReminder} skipped: no content`, { resourceId });
      return;
    }
    // eslint-disable-next-line no-restricted-syntax -- todoReminderContentSchema coerces dueAt itself
    const { items } = todoReminderContentSchema.parse(JSON.parse(buffer.toString()));
    const item = items.find(({ id }) => id === itemId);
    // The reminder fires against a save-time snapshot, so re-verify against the live blob: the item may
    // Have been deleted or re-dated (a re-dated item enqueued its own fresh reminder), which makes this
    // Stale reminder a silent no-op.
    if (item?.dueAt?.getTime() !== dueAt.getTime()) {
      context.log(`${AzureFunction.SendTodoReminder} skipped: item deleted or re-dated`, { itemId, resourceId });
      return;
    }

    await sendTodoReminderNotification(context, { itemName: item.name, resourceId, userId: resource.userId });
  }).match(noop, logAndRethrow(context, AzureFunction.SendTodoReminder));
