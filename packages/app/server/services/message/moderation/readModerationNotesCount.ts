import type { Clause } from "@esposter/azure";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";
import { readEntitiesCount } from "@esposter/db";
import { AzureTable, ModerationNoteEntity, ModerationNoteEntityPropertyNames } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// The paginated read only returns the loaded page, so the notes badge needs a true total. A target's
// Notes live in one room partition and are inherently few, so the keys-only walk is a single page.
export const readModerationNotesCount = async (
  roomId: RoomInMessage["id"],
  targetUserId: User["id"],
): Promise<number> => {
  const clauses: Clause<ModerationNoteEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.eq, value: targetUserId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  const moderationNotesClient = await useTableClient(AzureTable.ModerationNotes);
  return readEntitiesCount(moderationNotesClient, { filter: serializeClauses(clauses) });
};
