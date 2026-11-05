import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { SEARCH_KEY_NAME } from "#src/services/azure/search/constants";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

// The keys of the documents a filter matches, read one page at a time. A search answers at most a page, so a caller
// That deletes what it read reads again for the rest
export const readSearchDocumentKeys = async (
  searchClient: SearchClient<SearchIndexDocumentMap[SearchIndex.Messages]>,
  filter: string,
): Promise<string[]> => {
  const { results } = await searchClient.search("*", { filter, select: [SEARCH_KEY_NAME], top: AZURE_MAX_PAGE_SIZE });
  const keys: string[] = [];
  // The search key is the service's string, read under the model's property the compiler sees as a union of every field
  for await (const { document } of results) keys.push(document[SEARCH_KEY_NAME] as string);
  return keys;
};
