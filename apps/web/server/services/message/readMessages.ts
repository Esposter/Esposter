import type { ReadMessagesInput } from "#shared/models/db/message/ReadMessagesInput";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import type { MessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereStreamTable } from "#server/services/pagination/cursor/getCursorWhereStreamTable";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import {
  DEFAULT_READ_LIMIT,
  MESSAGE_OLDEST_FIRST_SORT_ITEM,
  MESSAGE_ROW_KEY_SORT_ITEM,
} from "#shared/services/pagination/constants";
import { getLivePartitionClauses, getTopNEntitiesByType } from "@esposter/db";
import {
  BinaryOperator,
  CompositeKey,
  MessageTypeEntityMap,
  StandardMessageEntityPropertyNames,
  StreamTable,
} from "@esposter/db-schema";

// A message's rowKey is reverse-ticked, so newest-first is the rowKey ascending and oldest-first the same rowKey
// descending. The cursor names a rowKey, so one page's last message is the next page's exclusive bound either way
export const readMessages = async ({
  cursor,
  filter: inputFilter,
  isIncludeValue,
  limit = DEFAULT_READ_LIMIT,
  order,
  roomId,
}: SetOptional<ReadMessagesInput, "limit">) => {
  const isOldestFirst = order === SortOrder.Asc;
  const sortItem = isOldestFirst ? MESSAGE_OLDEST_FIRST_SORT_ITEM : MESSAGE_ROW_KEY_SORT_ITEM;
  const sortBy: SortItem<keyof CompositeKey>[] = [{ isIncludeValue, ...sortItem }];
  const clauses = getLivePartitionClauses<MessageEntity>(roomId);
  if (inputFilter?.isPinned)
    clauses.push({ key: StandardMessageEntityPropertyNames.isPinned, operator: BinaryOperator.Eq, value: true });
  if (cursor) clauses.push(...getCursorWhereStreamTable(cursor, sortBy));

  const messageClient = useStreamTableClient(StreamTable.Messages);
  const messages = await getTopNEntitiesByType(messageClient, limit + 1, MessageTypeEntityMap, clauses, {
    orderBy: isOldestFirst ? "desc" : "asc",
  });
  return getCursorPaginationData(messages, limit, sortBy);
};
