import type { ReadMessagesInput } from "@@/server/trpc/routers/message";
import type { PartialByKeys } from "unocss";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { SortOrder } from "@@/shared/models/pagination/sorting/SortOrder";

export const readMessages = async ({
  cursor,
  limit,
  roomId,
  sortBy = [{ key: "rowKey", order: SortOrder.Asc }],
}: PartialByKeys<ReadMessagesInput, "sortBy">) => {
  let filter = getMessagesPartitionKeyFilter(roomId);
  if (cursor) filter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
  const messageClient = await useTableClient(AzureTable.Messages);
  const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
  return getCursorPaginationData(messages, limit, sortBy);
};
