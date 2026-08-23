import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SelectFields } from "@azure/search-documents";
import type { Clause } from "@esposter/azure";
import type { MessageEntity } from "@esposter/db-schema";

import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { readMessageSearchDocuments } from "@@/server/services/message/readMessageSearchDocuments";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { filtersToClauses, getSearchNullClause, serializeSearchClauses } from "@esposter/db";
import { FilterType, SearchIndex, SearchIndexSearchableFieldsMap } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const searchMessages = async ({ filters, limit, offset, query, roomId, sortBy }: SearchMessagesInput) => {
  const searchableFilters = getSearchableFilters(filters);
  const hasRoomInFilter = searchableFilters.some(({ type }) => type === FilterType.In);
  const clauses: Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] = [
    ...(hasRoomInFilter
      ? []
      : [{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId }]),
    getSearchNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  if (searchableFilters.length > 0) clauses.push(...filtersToClauses(searchableFilters));
  const { count, messages } = await readMessageSearchDocuments({
    filter: serializeSearchClauses(clauses),
    limit,
    offset,
    orderBy: sortBy.map(({ key, order }) => `${key} ${order}`),
    query,
    searchFields: SearchIndexSearchableFieldsMap[SearchIndex.Messages],
  });
  return { count, data: getOffsetPaginationData(messages, limit) };
};
