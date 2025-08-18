import type { SearchMessagesInput } from "@@/server/trpc/routers/message";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import { SearchIndexSearchableFieldsMap } from "@@/server/models/azure/search/SearchIndexSearchableFieldsMap";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { isPartitionKey } from "@esposter/shared";

export const searchMessages = async ({
  limit = DEFAULT_READ_LIMIT,
  offset = 0,
  query,
  roomId,
  sortBy,
}: SearchMessagesInput): Promise<OffsetPaginationData<MessageEntity>> => {
  const client = useSearchClient(SearchIndex.Messages);
  const { results } = await client.search(query, {
    filter: isPartitionKey(roomId),
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
    skip: offset,
    top: limit + 1,
  });
  const searchedMessages: MessageEntity[] = [];
  for await (const { document } of results) searchedMessages.push(document);
  return getOffsetPaginationData(searchedMessages, limit);
};
