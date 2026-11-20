import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";
import { getUserObject } from "#src/services/user/getUserObject";
import { getResultAsync, noop } from "@esposter/shared";

// The counter moves through the storage ledger: its releases run here in the jobs Worker, and its reservations run in
// The web app. The meter in the app reads it, so each owner's person hears the new figure on their own object.
// The owner's user row is sent whole, at the version this write left it, so the meter applies it as a row.
// Best-effort: the counter is durable by the time this runs.
// A failure here must never reject the handler and replay an at-least-once event whose work is already done
export const broadcastStorageUsage = (userIds: UserInAuth["id"][]): Promise<void> =>
  getResultAsync(async () => {
    if (userIds.length === 0) return;

    const users = await getDb().query.usersInAuth.findMany({ where: { id: { in: userIds } } });
    await Promise.all(
      users.map((user) =>
        getResultAsync(() => getUserObject(user.id).updateUsage(user)).match(noop, (error) => {
          console.error(`Failed to broadcast storage usage for ${user.id}:`, error);
        }),
      ),
    );
  }).match(noop, (error) => {
    console.error("Failed to broadcast storage usage:", error);
  });
