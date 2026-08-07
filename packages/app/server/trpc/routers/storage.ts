import type { StorageUsage } from "#shared/models/storage/StorageUsage";

import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const storageRouter = router({
  // Only the usage is stored — the quota is derived from the tier on every read, so moving a user to another
  // Tier changes what they see and what the gate enforces in the same instant. See /docs/platform/storage-quotas
  getUsage: standardAuthedProcedure.query<StorageUsage>(async ({ ctx }) => {
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
