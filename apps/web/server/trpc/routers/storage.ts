import type { StorageUsage } from "@esposter/db-schema";

import { router } from "#server/trpc";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, StorageTierQuotaMap } from "@esposter/db-schema";

export const storageRouter = router({
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
