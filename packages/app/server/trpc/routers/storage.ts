import type { StorageUsage } from "#shared/models/storage/StorageUsage";

import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { generateWebPubSubClientAccessUrl } from "@@/server/services/azure/webPubSub/generateWebPubSubClientAccessUrl";
import { storageEventEmitter } from "@@/server/services/storage/events/storageEventEmitter";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureWebPubSubHub, DatabaseEntityType } from "@esposter/db-schema";
import { on } from "node:events";

export const storageRouter = router({
  // The counter's other writer is the Functions host, which shares no event emitter with this process — so the
  // Blob events that settle a save or a deletion reach the meter through Web PubSub instead. The group is the
  // Account, not the device: a quota belongs to the user, and every device of theirs is stale by the same
  // Amount. See /docs/platform/storage-quotas
  generateWebPubSubClientAccessUrl: standardAuthedProcedure.query<string>(({ ctx, signal }) =>
    generateWebPubSubClientAccessUrl(
      AzureWebPubSubHub.Storage,
      ctx.getSessionPayload.user.id,
      ctx.getSessionPayload,
      signal,
    ),
  ),
  onUpdateUsage: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    const events = on(storageEventEmitter, "updateUsage", { signal });
    for await (const [[storageUsage, targetUserId]] of events) if (targetUserId === userId) yield storageUsage;
  }),
  // Only the usage is stored — the quota is derived from the tier on every read, so moving a user to another
  // Tier changes what they see and what the gate enforces in the same instant. See /docs/platform/storage-quotas
  readUsage: standardAuthedProcedure.query<StorageUsage>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const { storageBytesUsed, storageTier } = await requireEntity(
      ctx.db.query.users.findFirst({
        columns: { storageBytesUsed: true, storageTier: true },
        where: { id: { eq: userId } },
      }),
      DatabaseEntityType.User,
      userId,
    );
    return { bytesUsed: storageBytesUsed, quotaBytes: StorageTierQuotaMap[storageTier], tier: storageTier };
  }),
});
