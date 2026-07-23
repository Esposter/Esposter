import type { ModerationLogEntity } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { writeModerationLogEntry as baseWriteModerationLogEntry } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";

// Resolves the app's table client for the shared audit-log writer, so the manual admin-action plugin
// Never constructs one itself.
export const writeModerationLogEntry = async (
  entry: Pick<ModerationLogEntity, "actorUserId" | "durationMs" | "targetUserId" | "type"> & { roomId: string },
): Promise<void> => {
  const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
  await baseWriteModerationLogEntry(moderationLogClient, entry);
};
