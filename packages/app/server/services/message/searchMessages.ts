import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { Clause } from "@esposter/shared";

import { MessageEntity, MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { filtersToClauses } from "#shared/services/azure/search/filtersToClauses";
import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import { SearchIndexSearchableFieldsMap } from "@@/server/models/azure/search/SearchIndexSearchableFieldsMap";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { BinaryOperator, deserializeKey, escapeValue, serializeClauses } from "@esposter/shared";

export const searchMessages = async ({ filters, limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const client = useSearchClient(SearchIndex.Messages);
  const clauses: Clause[] = [
    { key: MessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: escapeValue(roomId) },
  ];
  if (filters.length > 0) clauses.push(...filtersToClauses(dedupeFilters(filters)));
  const { count, results } = await client.search(query, {
    filter: serializeClauses(clauses),
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
