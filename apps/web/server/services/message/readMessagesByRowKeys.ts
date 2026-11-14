import type { MessageEntity, StandardMessageEntity } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { getLivePartitionClauses, getTopNEntitiesByType } from "@esposter/db";
import { StreamTable, MessageTypeEntityMap, BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// A named set of a room's messages in one table scan rather than a point read each, with the deleted ones
// Filtered out by the same clause every other message read uses. The result is sorted newest-first — the
// Reverse-ticked rowKey ascending — so the order is this function's contract rather than the scan order it
// Happens to inherit from the table
export const readMessagesByRowKeys = async (
  roomId: string,
  rowKeys: StandardMessageEntity["rowKey"][],
): Promise<MessageEntity[]> => {
  const messageClient = useStreamTableClient(StreamTable.Messages);
  const clauses = getLivePartitionClauses<StandardMessageEntity>(roomId);
  for (const rowKey of rowKeys)
    clauses.push({ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Eq, value: rowKey });

  const messages = await getTopNEntitiesByType(messageClient, rowKeys.length, MessageTypeEntityMap, clauses);
  return messages.toSorted((firstMessage, secondMessage) => firstMessage.rowKey.localeCompare(secondMessage.rowKey));
};
