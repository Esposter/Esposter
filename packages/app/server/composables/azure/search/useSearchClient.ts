import type { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import type { SearchIndexDocumentMap } from "@@/server/models/azure/search/SearchIndexDocumentMap";

import { getSearchUrl } from "@@/server/services/azure/search/getSearchUrl";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

export const useSearchClient = <TIndex extends SearchIndex>(index: TIndex) => {
  const runtimeConfig = useRuntimeConfig();
  const endpoint = getSearchUrl();
  const apiKey = runtimeConfig.azure.search.apiKey as string;
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(endpoint, index, new AzureKeyCredential(apiKey));
};
