import type { ModerationNoteEntity, RoomInMessage, UserInAuth, Clause } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { getLivePartitionClauses, readEntitiesCount } from "@esposter/db";
import { StreamTable, ModerationNoteEntityPropertyNames, BinaryOperator } from "@esposter/db-schema";

// The paginated read only returns the loaded page, so the notes badge needs a true total. A target's
// Notes live in one room partition and are inherently few, so the keys-only walk is a single page.
export const readModerationNotesCount = async (
  roomId: RoomInMessage["id"],
  targetUserId: UserInAuth["id"],
): Promise<number> => {
  const clauses: Clause<ModerationNoteEntity>[] = [
    ...getLivePartitionClauses<ModerationNoteEntity>(roomId),
    { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.Eq, value: targetUserId },
  ];
  const moderationNotesClient = useStreamTableClient(StreamTable.ModerationNotes);
  return readEntitiesCount(moderationNotesClient, clauses);
};
