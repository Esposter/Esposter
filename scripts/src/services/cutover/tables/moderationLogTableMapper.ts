import type { TableMapper } from "#src/models/cutover/TableMapper";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { AdminActionType, moderationLogsInMessage, StreamTable } from "@esposter/db-schema";
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

// The ModerationLog table: one row per action, partitioned by room and read newest-first
export const moderationLogTableMapper: TableMapper = {
  azureTable: StreamTable.ModerationLog,
  countByPartitionSql: `SELECT "roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(moderationLogsInMessage)}" GROUP BY "roomId"`,
  coreTable: getTableName(moderationLogsInMessage),
  map: (entity, { idMap, parents, timestamp }) => {
    const log = legacyModerationLogSchema.parse(entity);
    if (!parents.roomIds.has(log.partitionKey) || !parents.userIds.has(log.targetUserId)) return undefined;
    const createdAt = getReverseTickedMilliseconds(log.rowKey);
    return {
      actorUserId: log.actorUserId,
      createdAt,
      deletedAt: null,
      durationMs: log.durationMs ?? null,
      id: idMap.assign(StreamTable.ModerationLog, log.partitionKey, log.rowKey),
      roomId: log.partitionKey,
      targetUserId: log.targetUserId,
      type: log.type,
      updatedAt: timestamp?.getTime() ?? createdAt,
    };
  },
};
