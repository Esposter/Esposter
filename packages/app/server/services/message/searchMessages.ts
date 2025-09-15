import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import { SearchIndexSearchableFieldsMap } from "@@/server/models/azure/search/SearchIndexSearchableFieldsMap";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { isPartitionKey } from "@esposter/shared";

export const searchMessages = async ({ limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const client = useSearchClient(SearchIndex.Messages);
  const { count, results } = await client.search(query || "*", {
    filter: isPartitionKey(roomId),
    includeTotalCount: true,
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
    skip: offset,
    top: limit + 1,
  });
  const searchedMessages: MessageEntity[] = [];
  for await (const { document } of results) searchedMessages.push(document);
  return { count, data: getOffsetPaginationData(searchedMessages, limit) };
};
