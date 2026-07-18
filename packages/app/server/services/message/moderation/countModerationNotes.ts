import type { Clause, RoomInMessage, User } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { countEntities, getTableNullClause, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ModerationNoteEntity,
  ModerationNoteEntityPropertyNames,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// The paginated read only returns the loaded page, so the notes badge needs a true total. A target's
// Notes live in one room partition and are inherently few, so the keys-only walk is a single page.
export const countModerationNotes = async (roomId: RoomInMessage["id"], targetUserId: User["id"]): Promise<number> => {
  const clauses: Clause<ModerationNoteEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    { key: ModerationNoteEntityPropertyNames.targetUserId, operator: BinaryOperator.eq, value: targetUserId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  const moderationNotesClient = await useTableClient(AzureTable.ModerationNotes);
  return countEntities(moderationNotesClient, { filter: serializeClauses(clauses) });
};
