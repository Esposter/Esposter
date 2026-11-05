import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { SEARCH_KEY_NAME } from "#src/services/azure/search/constants";
import { readSearchDocumentKeys } from "#src/services/azure/search/readSearchDocumentKeys";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Deletes every document the filter matches. A search answers one page at a time, so each page is deleted before the
// Filter is read again, until none is left. A replay over a finished deletion finds nothing and returns at once
export const deleteSearchDocumentsByFilter = async (
  searchClient: SearchClient<SearchIndexDocumentMap[SearchIndex.Messages]>,
  filter: string,
): Promise<void> => {
  let keys = await readSearchDocumentKeys(searchClient, filter);
  while (keys.length > 0) {
    // oxlint-disable-next-line no-await-in-loop -- Each page is read after the one before it is deleted
    const { results } = await searchClient.deleteDocuments(SEARCH_KEY_NAME, keys);
    const failedKeys = results.filter(({ succeeded }) => !succeeded).map(({ key }) => key);
    if (failedKeys.length > 0)
      throw new InvalidOperationError(
        Operation.Delete,
        deleteSearchDocumentsByFilter.name,
        `keys not deleted: ${failedKeys.join(", ")}`,
      );
    // oxlint-disable-next-line no-await-in-loop -- Each page is read after the one before it is deleted
    keys = await readSearchDocumentKeys(searchClient, filter);
  }
};
