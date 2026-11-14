import type { TableMapper } from "#src/models/cutover/TableMapper";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { moderationNotesInMessage, StreamTable } from "@esposter/db-schema";
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

// The ModerationNotes table: one row per note, partitioned by room and read newest-first
export const moderationNoteTableMapper: TableMapper = {
  azureTable: StreamTable.ModerationNotes,
  countByPartitionSql: `SELECT "roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(moderationNotesInMessage)}" GROUP BY "roomId"`,
  coreTable: getTableName(moderationNotesInMessage),
  map: (entity, { idMap, parents, timestamp }) => {
    const note = legacyModerationNoteSchema.parse(entity);
    if (!parents.roomIds.has(note.partitionKey) || !parents.userIds.has(note.targetUserId)) return undefined;
    const createdAt = getReverseTickedMilliseconds(note.rowKey);
    return {
      actorUserId: note.actorUserId && parents.userIds.has(note.actorUserId) ? note.actorUserId : null,
      createdAt,
      deletedAt: null,
      id: idMap.assign(StreamTable.ModerationNotes, note.partitionKey, note.rowKey),
      note: note.note,
      roomId: note.partitionKey,
      targetUserId: note.targetUserId,
      updatedAt: timestamp?.getTime() ?? createdAt,
    };
  },
};
