import type { Database, User } from "@esposter/db-schema";

import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { storageEventEmitter } from "@@/server/services/storage/events/storageEventEmitter";
import { getResultAsync, noop } from "@esposter/shared";

// Best-effort by construction, and it has to be: everything this announces is already durable by the time it
// Runs, so a failed read here must never turn a committed charge or release into a call that reports failure.
// What it costs when it does fail is a meter left on its previous number until the next event or the next
// Read — the counter itself is right either way, since this only reports it.
export const emitStorageUsage = (db: Database, userId: User["id"]): Promise<void> =>
  getResultAsync(async () => {
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
  }).match(noop, console.error);
