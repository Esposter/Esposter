import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { Clause, MessageEntity } from "@esposter/db-schema";

import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { deserializeKey, filtersToClauses, getSearchNullClause, serializeClauses } from "@esposter/db";
import {
  BinaryOperator,
  MessageType,
  SearchIndex,
  SearchIndexSearchableFieldsMap,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
  WebhookMessageEntity,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const searchMessages = async ({ filters, limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const client = useSearchClient(SearchIndex.Messages);
  const clauses: Clause[] = [
    { key: StandardMessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
    getSearchNullClause(ItemMetadataPropertyNames.deletedAt),
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
    searchedMessages.push(
      (deserializedDocument.type === MessageType.Webhook
        ? new WebhookMessageEntity(deserializedDocument)
        : new StandardMessageEntity(deserializedDocument)) as MessageEntity,
    );
  }
  return { count, data: getOffsetPaginationData(searchedMessages, limit) };
};
