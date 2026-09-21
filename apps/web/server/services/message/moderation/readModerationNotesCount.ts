import type { Clause } from "@esposter/azure";
import type { ModerationNoteEntity, RoomInMessage, User } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getLivePartitionClauses } from "@@/server/services/azure/table/getLivePartitionClauses";
import { BinaryOperator, serializeClauses } from "@esposter/azure";
import { readEntitiesCount } from "@esposter/db";
import { AzureTable, ModerationNoteEntityPropertyNames } from "@esposter/db-schema";

// The paginated read only returns the loaded page, so the notes badge needs a true total. A target's
// Notes live in one room partition and are inherently few, so the keys-only walk is a single page.
export const readModerationNotesCount = async (
  roomId: RoomInMessage["id"],
  targetUserId: User["id"],
): Promise<number> => {
  const clauses: Clause<ModerationNoteEntity>[] = [
    ...getLivePartitionClauses<ModerationNoteEntity>(roomId),
    { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.eq, value: targetUserId },
  ];
  const moderationNotesClient = await useTableClient(AzureTable.ModerationNotes);
  return readEntitiesCount(moderationNotesClient, { filter: serializeClauses(clauses) });
};
