import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadMessagesInput } from "@@/server/trpc/routers/message";

import { CompositeKey } from "#shared/models/azure/CompositeKey";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";

export const readMessages = async ({ cursor, isIncludeValue, limit, order, roomId }: ReadMessagesInput) => {
  const sortBy: SortItem<keyof MessageEntity>[] = [{ isIncludeValue, ...MESSAGE_ROWKEY_SORT_ITEM }];

  if (order === SortOrder.Asc) {
    // 1. Get ascending ids from the index table (MessagesAscending)
    let indexFilter = getMessagesPartitionKeyFilter(roomId);
    if (cursor) indexFilter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
    const indexClient = await useTableClient(AzureTable.MessagesAscending);
    const indices = await getTopNEntities(indexClient, limit + 1, CompositeKey, { filter: indexFilter });
    if (indices.length === 0) return getCursorPaginationData([], 0, []);
    // 2. Join by ids from main table
    const messageClient = await useTableClient(AzureTable.Messages);
    const filter = `${getMessagesPartitionKeyFilter(roomId)} and (${indices
      .map(({ rowKey }) => `RowKey eq ${getReverseTickedTimestamp(rowKey)}`)
      .join(" or ")})`;
    const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
    return getCursorPaginationData(messages, limit, sortBy);
  }
  // Default: Desc via reverse-ticked RowKey (efficient)
  let filter = getMessagesPartitionKeyFilter(roomId);
  if (cursor) filter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
  return getCursorPaginationData(messages, limit, sortBy);
};
