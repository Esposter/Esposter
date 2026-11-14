import type { TableMapper } from "#src/models/cutover/TableMapper";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { moderationNotesInMessage } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// A moderator's private note on a member, kept with the room it was written in
const legacyModerationNoteSchema = z.object({
  actorUserId: z.string().optional(),
  note: z.string(),
  partitionKey: z.string(),
  rowKey: z.string(),
  targetUserId: z.string(),
});

// The ModerationNotes table: one row per note, partitioned by room and read newest-first.
// Every id it holds is a Postgres row's, so each is written with its new id
export const moderationNoteTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.ModerationNotes,
  coreTable: getTableName(moderationNotesInMessage),
  countByPartitionSql: `SELECT "roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(moderationNotesInMessage)}" GROUP BY "roomId"`,
  toRow: (entity, { idMap, parents, timestamp }) => {
    const note = legacyModerationNoteSchema.parse(entity);
    const roomId = idMap.rewrite(note.partitionKey);
    const targetUserId = idMap.rewrite(note.targetUserId);
    const actorUserId = note.actorUserId === undefined ? undefined : idMap.rewrite(note.actorUserId);
    if (!parents.roomIds.has(roomId) || !parents.userIds.has(targetUserId)) return undefined;

    const createdAt = getReverseTickedMilliseconds(note.rowKey);
    return {
      actorUserId: actorUserId && parents.userIds.has(actorUserId) ? actorUserId : null,
      createdAt,
      deletedAt: null,
      id: idMap.assign(LegacyAzureTable.ModerationNotes, note.partitionKey, note.rowKey, new Date(createdAt)).id,
      note: note.note,
      roomId,
      targetUserId,
      updatedAt: timestamp?.getTime() ?? createdAt,
    };
  },
};
