import type { TableMapper } from "#src/models/cutover/TableMapper";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { AdminActionType, moderationLogsInMessage } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// One moderation action taken in a room against a member
const legacyModerationLogSchema = z.object({
  actorUserId: z.string(),
  durationMs: z.number().optional(),
  partitionKey: z.string(),
  rowKey: z.string(),
  targetUserId: z.string(),
  type: z.enum(AdminActionType),
});

// The ModerationLog table: one row per action, partitioned by room and read newest-first.
// Every id it holds is a Postgres row's, so each is written with its new id
export const moderationLogTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.ModerationLog,
  coreTable: getTableName(moderationLogsInMessage),
  countByPartitionSql: `SELECT "roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(moderationLogsInMessage)}" GROUP BY "roomId"`,
  toRow: (entity, { idMap, parents, timestamp }) => {
    const log = legacyModerationLogSchema.parse(entity);
    const roomId = idMap.rewrite(log.partitionKey);
    const targetUserId = idMap.rewrite(log.targetUserId);
    if (!parents.roomIds.has(roomId) || !parents.userIds.has(targetUserId)) return undefined;

    const createdAt = getReverseTickedMilliseconds(log.rowKey);
    return {
      actorUserId: idMap.rewrite(log.actorUserId),
      createdAt,
      deletedAt: null,
      durationMs: log.durationMs ?? null,
      id: idMap.assign(LegacyAzureTable.ModerationLog, log.partitionKey, log.rowKey, new Date(createdAt)).id,
      roomId,
      targetUserId,
      type: log.type,
      updatedAt: timestamp?.getTime() ?? createdAt,
    };
  },
};
