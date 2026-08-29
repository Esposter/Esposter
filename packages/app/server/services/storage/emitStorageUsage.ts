import type { Database, User } from "@esposter/db-schema";

import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { storageEventEmitter } from "@@/server/services/storage/events/storageEventEmitter";

export const emitStorageUsage = async (db: Database, userId: User["id"]): Promise<void> => {
  const user = await db.query.users.findFirst({
    columns: { storageBytesUsed: true, storageTier: true },
    where: { id: { eq: userId } },
  });
  if (!user) return;

  const { storageBytesUsed, storageTier } = user;
  storageEventEmitter.emit("updateUsage", [
    { bytesUsed: storageBytesUsed, quotaBytes: StorageTierQuotaMap[storageTier], tier: storageTier },
    userId,
  ]);
};
