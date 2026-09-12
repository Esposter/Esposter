import type { ReadMessageSearchDocumentsOptions } from "@@/server/models/message/ReadMessageSearchDocumentsOptions";
import type { MessageEntity } from "@esposter/db-schema";

import { useSearchClient } from "@@/server/composables/azure/search/useSearchClient";
import { deserializeMessageSearchDocument } from "@@/server/services/message/deserializeMessageSearchDocument";
import { SearchIndex } from "@esposter/db-schema";

// The one paged read of the message index: every caller wants the same page shape and the same total, so the
// Extra row that answers `hasMore` and the deserialization back into entity classes are settled here rather
// Than at each call site. The total is passed through as the service reported it — a caller that must have a
// Number decides what an absent one means.
export const readMessageSearchDocuments = async ({
  limit,
  offset,
  query,
  ...searchOptions
}: ReadMessageSearchDocumentsOptions): Promise<{ count?: number; messages: MessageEntity[] }> => {
  const { count, results } = await useSearchClient(SearchIndex.Messages).search(query || "*", {
    ...searchOptions,
    includeTotalCount: true,
    skip: offset,
    top: limit + 1,
  });
  const messages: MessageEntity[] = [];
  for await (const { document } of results) messages.push(deserializeMessageSearchDocument(document));
  return { count, messages };
};
