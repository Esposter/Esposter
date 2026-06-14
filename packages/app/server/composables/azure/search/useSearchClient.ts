import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(
    runtimeConfig.azure.search.baseUrl,
    index,
    new AzureKeyCredential(runtimeConfig.azure.search.apiKey),
  );
};
