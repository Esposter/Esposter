import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadMessagesInput } from "@@/server/trpc/routers/message";
import type { Clause } from "@esposter/shared";
import type { PartialByKeys } from "unocss";

import { MessageEntity, MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { DEFAULT_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import {
  BinaryOperator,
  CompositeKey,
  getTableNullClause,
  ItemMetadataPropertyNames,
  serializeClauses,
} from "@esposter/shared";

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
    { key: MessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    getTableNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (inputFilter?.isPinned)
    clauses.push({ key: MessageEntityPropertyNames.isPinned, operator: BinaryOperator.eq, value: true });

  if (order === SortOrder.Asc) {
    // 1. Get ascending ids from the index table (MessagesAscending)
    const indexClauses: Clause[] = [
      { key: MessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
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
        key: MessageEntityPropertyNames.rowKey,
        operator: BinaryOperator.eq,
        value: getReverseTickedTimestamp(rowKey),
      });
    // We don't need to fetch limit + 1 here because the pagination metadata
    // is actually determined by the index table, not the message table
    const messages = await getTopNEntities(messageClient, limit, MessageEntity, { filter: serializeClauses(clauses) });
    return Object.assign(getCursorPaginationData(messages, limit, sortBy), { hasMore, nextCursor });
  }
  // Default: Desc via reverse-ticked RowKey (efficient)
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, {
    filter: serializeClauses(clauses),
  });
  return getCursorPaginationData(messages, limit, sortBy);
};
