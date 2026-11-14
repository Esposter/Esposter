import type { UserInAuth } from "@esposter/db-schema";

import { publishToServer } from "#src/services/server/publishToServer";
import { PublishEventType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The counter moves in two processes and is only ever read in one. A blob event settles it here, in the
// Functions host, while the meter watching it is subscribed to an in-process emitter in the app — so without
// This the number is right in postgres and stale on screen until the next full page load. The event names the
// Owner rather than a device, because the quota is a property of the account and every device showing it is
// Wrong by the same amount. See openspec/specs/resource/storage-quotas/design.md
//
// The event says only whose counter moved: the server reads the figure and derives the quota from the tier, so a
// Figure is computed in one place and cannot disagree with the gate the server enforces.
//
// Best-effort, and it has to be: the counter is durable by the time this runs, so a publish failure must
// Never reject the handler and replay an at-least-once event whose work is already done.
export const broadcastStorageUsage = async (userIds: UserInAuth["id"][]): Promise<void> => {
  if (userIds.length === 0) return;

  await Promise.all(
    userIds.map((userId) =>
      getResultAsync(() => publishToServer({ type: PublishEventType.Storage, userId })).match(noop, (error) => {
        console.error(`Failed to broadcast storage usage for ${userId}: `, error);
      }),
    ),
  );
};
