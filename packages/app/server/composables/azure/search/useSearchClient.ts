import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { useSearchBaseUrl } from "@@/server/composables/azure/search/useSearchBaseUrl";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  const searchBaseUrl = useSearchBaseUrl();
  const apiKey = runtimeConfig.azure.search.apiKey;
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(searchBaseUrl, index, new AzureKeyCredential(apiKey));
};
