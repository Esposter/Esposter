import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { getAzureSearchBaseUrl } from "#shared/services/azure/search/getAzureSearchBaseUrl";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  const azureSearchBaseUrl = getAzureSearchBaseUrl();
  const azureKeyCredential = new AzureKeyCredential(runtimeConfig.azure.search.apiKey);
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(azureSearchBaseUrl, index, azureKeyCredential);
};
