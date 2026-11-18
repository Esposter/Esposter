import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { roomRouter } from "#server/trpc/routers/room/index";
import { webhookRouter } from "#server/trpc/routers/webhook";

const name = "name";
const updatedName = "updatedName";

// The webhook router's cases for the app-wide live topic check: the room's list reads its webhooks, and the app user each
// One posts as, so a webhook is created, renamed or deleted and each of those reads answers differently
export const createWebhookLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const room = await createCallerFactory(roomRouter)(context).createRoom({ name });
  const { webhook } = await createCallerFactory(webhookRouter)(context).createWebhook({ name, roomId: room.id });
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).webhook.readWebhooks({ roomId: room.id }),
        path: "webhook.readWebhooks",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).webhook.readAppUsers({ ids: [webhook.userId], roomId: room.id }),
        path: "webhook.readAppUsers",
      },
    ],
    // A room holds one webhook, so the create runs last, once the delete has emptied the room the factory filled
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).webhook.updateWebhook({
            id: webhook.id,
            name: updatedName,
            roomId: room.id,
          }),
        path: "webhook.updateWebhook",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).webhook.deleteWebhook({ id: webhook.id, roomId: room.id }),
        path: "webhook.deleteWebhook",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).webhook.createWebhook({ name, roomId: room.id }),
        path: "webhook.createWebhook",
      },
    ],
  };
};
