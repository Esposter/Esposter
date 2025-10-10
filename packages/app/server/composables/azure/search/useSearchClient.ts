import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db";

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { getSearchUrl } from "@esposter/db";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  const endpoint = getSearchUrl();
  const apiKey = runtimeConfig.azure.search.apiKey;
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(endpoint, index, new AzureKeyCredential(apiKey));
};
