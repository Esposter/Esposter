import type { InvocationContext } from "@azure/functions";
import type { User } from "@esposter/db-schema";

import { getWebPubSubServiceClient } from "#src/services/getWebPubSubServiceClient";
import { AzureWebPubSubHub } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The counter moves in two processes and is only ever read in one. A blob event settles it here, in the
// Functions host, while the meter watching it is subscribed to an in-process emitter in the app — so without
// This the number is right in postgres and stale on screen until the next full page load. The group is the
// Owner rather than a device, because the quota is a property of the account and every device showing it is
// Wrong by the same amount. See /docs/platform/storage-quotas
//
// The payload says only whose counter moved: the quota is derived from the tier by the app, and a figure
// Computed twice on either side of a process boundary is a figure that can disagree with the gate. The client
// Re-reads instead, which is one round trip on an event that already lags its write by seconds.
//
// Best-effort, and it has to be: the counter is durable by the time this runs, so a broadcast failure must
// Never reject the handler and replay an at-least-once event whose work is already done.
export const broadcastStorageUsage = async (context: InvocationContext, userIds: User["id"][]): Promise<void> => {
  if (userIds.length === 0) return;

  const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Storage);
  await Promise.all(
    userIds.map((userId) =>
      getResultAsync(() => webPubSubServiceClient.group(userId).sendToAll({ userId })).match(noop, (error) => {
        context.error(`Failed to broadcast storage usage for ${userId}: `, error);
      }),
    ),
  );
};
