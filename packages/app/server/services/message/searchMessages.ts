import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SelectFields } from "@azure/search-documents";
import type { Clause, MessageEntity } from "@esposter/db-schema";

import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { deserializeMessageSearchDocument } from "@@/server/services/message/deserializeMessageSearchDocument";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { filtersToClauses, getSearchNullClause, serializeClauses } from "@esposter/db";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  FilterType,
  SearchIndex,
  SearchIndexSearchableFieldsMap,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const searchMessages = async ({ filters, limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const client = useSearchClient(SearchIndex.Messages);
  const dedupedFilters = dedupeFilters(filters);
  const hasRoomInFilter = dedupedFilters.some(({ type }) => type === FilterType.In);
  const clauses: Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] = [
    ...(hasRoomInFilter
      ? []
      : [{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }]),
    getSearchNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (dedupedFilters.length > 0) clauses.push(...filtersToClauses(dedupedFilters));
  const { count, results } = await client.search(query, {
    filter: serializeClauses(clauses),
    includeTotalCount: true,
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
    skip: offset,
    top: limit + 1,
  });
  const messages: MessageEntity[] = [];
  for await (const { document } of results) messages.push(deserializeMessageSearchDocument(document));
  return { count, data: getOffsetPaginationData(messages, limit) };
};
