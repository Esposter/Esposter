import type { ReadMessagesInput } from "#shared/models/db/message/ReadMessagesInput";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause } from "@esposter/azure";
import type { MessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { DEFAULT_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import {
  BinaryOperator,
  CompositeKey,
  CompositeKeyPropertyNames,
  getTableNullClause,
  serializeClauses,
} from "@esposter/azure";
import { getTopNEntities, getTopNEntitiesByType } from "@esposter/db";
import {
  AzureTable,
  getReverseTickedTimestamp,
  MessageTypeEntityMap,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const readMessages = async ({
  cursor,
  filter: inputFilter,
  isIncludeValue,
  limit = DEFAULT_READ_LIMIT,
  order,
  roomId,
}: SetOptional<ReadMessagesInput, "limit">) => {
  const sortBy: SortItem<keyof CompositeKey>[] = [{ isIncludeValue, ...MESSAGE_ROWKEY_SORT_ITEM }];
  const clauses: Clause<MessageEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (inputFilter?.isPinned)
    clauses.push({ key: StandardMessageEntityPropertyNames.isPinned, operator: BinaryOperator.eq, value: true });

  if (order === SortOrder.Asc) {
    const indexClauses: Clause<MessageEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    ];
    if (cursor) indexClauses.push(...getCursorWhereAzureTable(cursor, sortBy));
    const indexClient = await useTableClient(AzureTable.MessagesAscending);
    const indices = await getTopNEntities(indexClient, limit + 1, CompositeKey, {
      filter: serializeClauses(indexClauses),
    });
    if (indices.length === 0) return getCursorPaginationData([], 0, []);
    const { hasMore, items, nextCursor } = getCursorPaginationData(indices, limit, sortBy);
    const messageClient = await useTableClient(AzureTable.Messages);
    for (const { rowKey } of items)
      clauses.push({
        key: CompositeKeyPropertyNames.rowKey,
        operator: BinaryOperator.eq,
        value: getReverseTickedTimestamp(rowKey),
      });
    // The index table already decided the pagination metadata, so this join fetches no extra row
    const messages = await getTopNEntitiesByType(messageClient, limit, MessageTypeEntityMap, {
      filter: serializeClauses(clauses),
    });
    // The Messages table scans newest-first on its reverse-ticked rowKey, so the rows are re-projected onto the
    // Ascending sequence the index established rather than trusting the join's scan order.
    //
    // An index row the join cannot match is dropped and the cursor still advances past it, and the cursor must
    // Never be held on such a row: a soft delete produces the same shape — `deleteMessage` stamps `deletedAt`,
    // Which the join filters, and leaves the index row — so a hole says nothing about whether an entity is
    // Coming, and every caller advances only by `nextCursor` while `hasMore` is set, making a returned incoming
    // Cursor a hot loop rather than a wait. The write-side window is bounded instead: `createMessage` drops the
    // Index row when the entity write fails, so a hole outlives one in-flight write only when that compensating
    // Delete also fails ([messaging](/docs/esbabbler/messaging))
    const messageMap = new Map(messages.map((message) => [message.rowKey, message]));
    const ascendingMessages = items.flatMap((index) => {
      const message = messageMap.get(getReverseTickedTimestamp(index.rowKey));
      return message ? [message] : [];
    });
    return { hasMore, items: ascendingMessages, nextCursor };
  }
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntitiesByType(messageClient, limit + 1, MessageTypeEntityMap, {
    filter: serializeClauses(clauses),
  });
  return getCursorPaginationData(messages, limit, sortBy);
};
