import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadMessagesInput } from "@@/server/trpc/routers/message";
import type { Clause, MessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { DEFAULT_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { MESSAGE_INDEX_WRITE_GRACE_NANOSECONDS } from "@@/server/services/message/constants";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { getTableNullClause, getTopNEntities, getTopNEntitiesByType, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  CompositeKey,
  CompositeKeyPropertyNames,
  getReverseTickedTimestamp,
  MessageEntityMap,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames, now } from "@esposter/shared";

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
    // 1. Get ascending ids from the index table (MessagesAscending)
    const indexClauses: Clause<MessageEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    ];
    if (cursor) indexClauses.push(...getCursorWhereAzureTable(cursor, sortBy));
    const indexClient = await useTableClient(AzureTable.MessagesAscending);
    const indices = await getTopNEntities(indexClient, limit + 1, CompositeKey, {
      filter: serializeClauses(indexClauses),
    });
    if (indices.length === 0) return getCursorPaginationData([], 0, []);
    // 2. Join by ids from main table
    const { hasMore, items, nextCursor } = getCursorPaginationData(indices, limit, sortBy);
    const messageClient = await useTableClient(AzureTable.Messages);
    for (const { rowKey } of items)
      clauses.push({
        key: CompositeKeyPropertyNames.rowKey,
        operator: BinaryOperator.eq,
        value: getReverseTickedTimestamp(rowKey),
      });
    // No need to fetch limit + 1 here; the index table determines the pagination metadata.
    const messages = await getTopNEntitiesByType(messageClient, limit, MessageEntityMap, {
      filter: serializeClauses(clauses),
    });
    // The Messages table scans newest-first (reverse-ticked rowKey), so re-project onto the ascending
    // Sequence the MessagesAscending index established rather than trusting the join's scan order.
    //
    // An index row exists before the entity it points at — `createMessage` writes this table first, and the two
    // Cannot be written atomically — so a row with no entity is either a write still in flight or the orphan a
    // Failed one left behind. The page stops at an in-flight hole instead of stepping over it: the cursor is
    // Derived from the index, so advancing past a message whose entity lands a moment later drops it from the
    // Rest of that client's ascending scroll entirely. Past the grace window the hole can only be an orphan, and
    // Holding the cursor there would stall the scroll forever, so those are skipped as before.
    const messageMap = new Map(messages.map((message) => [message.rowKey, message]));
    const inFlightCutoff = BigInt(now()) - MESSAGE_INDEX_WRITE_GRACE_NANOSECONDS;
    const ascendingIndices: CompositeKey[] = [];
    const ascendingMessages: MessageEntity[] = [];
    let isTruncated = false;
    for (const index of items) {
      const message = messageMap.get(getReverseTickedTimestamp(index.rowKey));
      if (message) {
        ascendingIndices.push(index);
        ascendingMessages.push(message);
      } else if (BigInt(index.rowKey) > inFlightCutoff) {
        isTruncated = true;
        break;
      }
    }
    if (!isTruncated) return { hasMore, items: ascendingMessages, nextCursor };
    // Resume from the last message actually served, or from where this page started when the hole is the first row
    return {
      hasMore: true,
      items: ascendingMessages,
      nextCursor: ascendingIndices.length > 0 ? getNextCursor(ascendingIndices, sortBy) : (cursor ?? ""),
    };
  }
  // Default: Desc via reverse-ticked RowKey (efficient)
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntitiesByType(messageClient, limit + 1, MessageEntityMap, {
    filter: serializeClauses(clauses),
  });
  return getCursorPaginationData(messages, limit, sortBy);
};
