import type { ServiceBusQueueHandler } from "@azure/functions";

import { todoReminderContentSchema } from "#src/models/todoReminder/TodoReminderContent";
import { eventGridPublisherClient } from "#src/services/azure/eventGridPublisherClient";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { readResourceContentBlob } from "@esposter/db";
import {
  AppNotificationType,
  AzureContainer,
  AzureFunction,
  publishNotification,
  ResourceType,
  todoReminderQueueMessageSchema,
} from "@esposter/db-schema";
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
    // A missing content blob means nothing to remind about, so it drops the reminder while transient Azure
    // Failures surface for a retry instead of being swallowed as "no content".
    const buffer = await readResourceContentBlob(containerClient, resourceId);
    if (!buffer) {
      context.log(`${AzureFunction.SendTodoReminder} skipped: no content`, { resourceId });
      return;
    }
    // oxlint-disable-next-line no-restricted-properties -- todoReminderContentSchema coerces dueAt itself
    const { items } = todoReminderContentSchema.parse(JSON.parse(buffer.toString()));
    const item = items.find(({ id }) => id === itemId);
    // The reminder fires against a save-time snapshot, so re-verify against the live blob: the item may
    // Have been deleted or re-dated (a re-dated item enqueued its own fresh reminder), which makes this
    // Stale reminder a silent no-op.
    if (item?.dueAt?.getTime() !== dueAt.getTime()) {
      context.log(`${AzureFunction.SendTodoReminder} skipped: item deleted or re-dated`, { itemId, resourceId });
      return;
    }

    await publishNotification(eventGridPublisherClient, {
      itemName: item.name,
      resourceId,
      type: AppNotificationType.TodoReminder,
      userId: resource.userId,
    });
  }).match(noop, logAndRethrow(context, AzureFunction.SendTodoReminder));
