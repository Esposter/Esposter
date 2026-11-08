import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { AzureKeyCredential } from "@azure/search-documents";
import { getSearchClient } from "@esposter/db";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  return getSearchClient(
    process.env.AZURE_SEARCH_BASE_URL,
    index,
    new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
  );
};
