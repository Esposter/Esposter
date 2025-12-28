import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadMessagesInput } from "@@/server/trpc/routers/message";
import type { Clause } from "@esposter/db-schema";
import type { PartialByKeys } from "@esposter/shared";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { DEFAULT_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { getTableNullClause, getTopNEntities, getTopNEntitiesByType, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  CompositeKey,
  getReverseTickedTimestamp,
  MessageEntityMap,
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
}: PartialByKeys<ReadMessagesInput, "limit">) => {
  const sortBy: SortItem<keyof CompositeKey>[] = [{ isIncludeValue, ...MESSAGE_ROWKEY_SORT_ITEM }];
  const clauses: Clause[] = [
    { key: StandardMessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (inputFilter?.isPinned)
    clauses.push({ key: StandardMessageEntityPropertyNames.isPinned, operator: BinaryOperator.eq, value: true });

  if (order === SortOrder.Asc) {
    // 1. Get ascending ids from the index table (MessagesAscending)
    const indexClauses: Clause[] = [
      { key: StandardMessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
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
        key: StandardMessageEntityPropertyNames.rowKey,
        operator: BinaryOperator.eq,
        value: getReverseTickedTimestamp(rowKey),
      });
    // We don't need to fetch limit + 1 here because the pagination metadata
    // Is actually determined by the index table, not the message table
    const messages = await getTopNEntitiesByType(messageClient, limit, MessageEntityMap, {
      filter: serializeClauses(clauses),
    });
    return Object.assign(getCursorPaginationData(messages, limit, sortBy), { hasMore, nextCursor });
  }
  // Default: Desc via reverse-ticked RowKey (efficient)
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntitiesByType(messageClient, limit + 1, MessageEntityMap, {
    filter: serializeClauses(clauses),
  });
  return getCursorPaginationData(messages, limit, sortBy);
};
