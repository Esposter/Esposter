import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SelectFields } from "@azure/search-documents";
import type { Clause, MessageEntity } from "@esposter/db-schema";

import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { readMessageSearchDocuments } from "@@/server/services/message/readMessageSearchDocuments";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { filtersToClauses, getSearchNullClause, serializeSearchClauses } from "@esposter/db";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  FilterType,
  SearchIndex,
  SearchIndexSearchableFieldsMap,
  StandardMessageEntityPropertyNames,
  UnaryOperator,
} from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const searchMessages = async ({
  filters,
  hasFiles,
  limit,
  offset,
  query,
  roomId,
  sortBy,
}: SearchMessagesInput) => {
  const searchableFilters = getSearchableFilters(filters);
  const hasRoomInFilter = searchableFilters.some(({ type }) => type === FilterType.In);
  const clauses: Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] = [
    ...(hasRoomInFilter
      ? []
      : [{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }]),
    getSearchNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (searchableFilters.length > 0) clauses.push(...filtersToClauses(searchableFilters));
  const serializedClauses = serializeSearchClauses(clauses);
  // "Has files" is a non-empty-collection test rather than a value clause, so it appends as a raw OData any().
  const filter = hasFiles
    ? `${serializedClauses} ${UnaryOperator.and} ${StandardMessageEntityPropertyNames.files}/any()`
    : serializedClauses;
  const { count, messages } = await readMessageSearchDocuments({
    filter,
    limit,
    offset,
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    query,
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
  });
  return { count, data: getOffsetPaginationData(messages, limit) };
};
