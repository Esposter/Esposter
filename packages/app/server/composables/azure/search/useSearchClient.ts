import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { AZURE_SEARCH_BASE_URL } from "#shared/services/azure/search/constants";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  const apiKey = runtimeConfig.azure.search.apiKey;
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(AZURE_SEARCH_BASE_URL, index, new AzureKeyCredential(apiKey));
};
