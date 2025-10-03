import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { filtersToClauses } from "#shared/services/azure/search/filtersToClauses";
import { deserializeKey } from "#shared/services/azure/table/deserializeKey";
import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import { SearchIndexSearchableFieldsMap } from "@@/server/models/azure/search/SearchIndexSearchableFieldsMap";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { isPartitionKey, serializeClauses, UnaryOperator } from "@esposter/shared";

export const searchMessages = async ({ filters, limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const client = useSearchClient(SearchIndex.Messages);
  let filter = isPartitionKey(roomId);
  if (filters.length > 0) {
    const clauses = filtersToClauses(dedupeFilters(filters));
    filter += ` ${UnaryOperator.and} ${serializeClauses(clauses)}`;
  }
  const { count, results } = await client.search(query, {
    filter,
    includeTotalCount: true,
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
    skip: offset,
    top: limit + 1,
  });
  const searchedMessages: MessageEntity[] = [];
  for await (const { document } of results) {
    const deserializedDocument = Object.fromEntries(
      Object.entries(document).map(([key, value]) => [deserializeKey(key), value]),
    ) as unknown as MessageEntity;
    searchedMessages.push(new MessageEntity(deserializedDocument));
  }
  return { count, data: getOffsetPaginationData(searchedMessages, limit) };
};
