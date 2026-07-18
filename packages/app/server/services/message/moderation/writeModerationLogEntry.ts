import type { ModerationLogEntity } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createEntity } from "@esposter/db";
import {
  AzureTable,
  getReverseTickedTimestamp,
  ModerationLogEntity as ModerationLogEntityClass,
} from "@esposter/db-schema";

// Appends one row to the moderation audit log. Shared by the manual admin-action plugin and by automod,
// so the reverse-ticked rowKey and table client are constructed in exactly one place.
export const writeModerationLogEntry = async (
  entry: Pick<ModerationLogEntity, "actorUserId" | "durationMs" | "targetUserId" | "type"> & { roomId: string },
): Promise<void> => {
  const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
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
