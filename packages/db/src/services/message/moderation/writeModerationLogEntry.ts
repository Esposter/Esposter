import type { CustomTableClient, ModerationLogEntity } from "@esposter/db-schema";

import { createEntity } from "@/services/azure/table/createEntity";
import { getReverseTickedTimestamp, ModerationLogEntity as ModerationLogEntityClass } from "@esposter/db-schema";

// Appends one row to the moderation audit log. Shared by the manual admin-action plugin, by automod, and by
// The scheduled-delivery function, so the reverse-ticked rowKey is constructed in exactly one place.
export const writeModerationLogEntry = async (
  moderationLogClient: CustomTableClient<ModerationLogEntity>,
  entry: Pick<ModerationLogEntity, "actorUserId" | "durationMs" | "targetUserId" | "type"> & { roomId: string },
): Promise<void> => {
  await createEntity(
    moderationLogClient,
    new ModerationLogEntityClass({
      actorUserId: entry.actorUserId,
      durationMs: entry.durationMs,
      partitionKey: entry.roomId,
      rowKey: getReverseTickedTimestamp(),
      targetUserId: entry.targetUserId,
      type: entry.type,
    }),
  );
};
