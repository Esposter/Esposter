import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { getUserObject } from "#src/services/user/getUserObject";
import { StorageTierQuotaMap } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The counter moves through the storage ledger: its releases run here in the jobs Worker, and its reservations run in
// The web app. The meter in the app reads it, so each owner's person hears the new figure on their own object.
// The usage is read here and the quota is derived from the tier.
// So the figure the meter shows is the one the server gates on.
// Best-effort: the counter is durable by the time this runs.
// A failure here must never reject the handler and replay an at-least-once event whose work is already done
export const broadcastStorageUsage = (userIds: UserInAuth["id"][]): Promise<void> =>
  getResultAsync(async () => {
    if (userIds.length === 0) return;

    const users = await db.query.usersInAuth.findMany({
      columns: { id: true, storageBytesUsed: true, storageTier: true },
      where: { id: { in: userIds } },
    });
    await Promise.all(
      users.map(({ id, storageBytesUsed, storageTier }) =>
        getResultAsync(() =>
          getUserObject(id).updateUsage({
            bytesUsed: storageBytesUsed,
            quotaBytes: StorageTierQuotaMap[storageTier],
            tier: storageTier,
          }),
        ).match(noop, (error) => {
          console.error(`Failed to broadcast storage usage for ${id}:`, error);
        }),
      ),
    );
  }).match(noop, (error) => {
    console.error("Failed to broadcast storage usage:", error);
  });
