import type { Clause } from "@esposter/azure";
import type { MessageEntity, StandardMessageEntity } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";
import { getTopNEntitiesByType } from "@esposter/db";
import { AzureTable, MessageTypeEntityMap } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

// A named set of a room's messages in one table scan rather than a point read each, with the deleted ones
// Filtered out by the same clause every other message read uses. The result is sorted newest-first — the
// Reverse-ticked rowKey ascending — so the order is this function's contract rather than the scan order it
// Happens to inherit from the table
export const readMessagesByRowKeys = async (
  roomId: string,
  rowKeys: StandardMessageEntity["rowKey"][],
): Promise<MessageEntity[]> => {
  const messageClient = await useTableClient(AzureTable.Messages);
  const clauses: Clause<StandardMessageEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  for (const rowKey of rowKeys)
    clauses.push({
      key: CompositeKeyPropertyNames.rowKey,
      operator: BinaryOperator.eq,
      value: rowKey,
    });

  const messages = await getTopNEntitiesByType(messageClient, rowKeys.length, MessageTypeEntityMap, {
    filter: serializeClauses(clauses),
  });
  return messages.toSorted((first, second) => first.rowKey.localeCompare(second.rowKey));
};
