import type { StorageUsage } from "@esposter/db-schema";
import { on } from "#server/services/events/on";
import { storageEventEmitter } from "#server/services/storage/events/storageEventEmitter";
import { router } from "#server/trpc";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { DatabaseEntityType } from "@esposter/db-schema";

export const storageRouter = router({
  // The Functions host settles the counter too, and reports each change through the server object's publish route,
  // Which re-emits it on this emitter. The usage is read per account, so the meter is stale by no more than one event.
  // See openspec/specs/resource/storage-quotas/design.md
  onUpdateUsage: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    const userId = ctx.getSessionPayload.user.id;
    const events = on(storageEventEmitter, "updateUsage", { signal });
    for await (const [[storageUsage, targetUserId]] of events) if (targetUserId === userId) yield storageUsage;
  }),
  // Only the usage is stored — the quota is derived from the tier on every read, so moving a user to another
  // Tier changes what they see and what the gate enforces in the same instant. See openspec/specs/resource/storage-quotas/design.md
  readUsage: standardAuthedProcedure.query<StorageUsage>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const { storageBytesUsed, storageTier } = await requireEntity(
      ctx.db.query.usersInAuth.findFirst({
        columns: { storageBytesUsed: true, storageTier: true },
        where: { id: { eq: userId } },
      }),
      DatabaseEntityType.User,
      userId,
    );
    return { bytesUsed: storageBytesUsed, quotaBytes: StorageTierQuotaMap[storageTier], tier: storageTier };
  }),
});
