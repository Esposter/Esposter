import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { AzureKeyCredential } from "@azure/search-documents";
import { getSearchClient } from "@esposter/db";
import { useRuntimeConfig } from "nuxt/server";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  const runtimeConfig = useRuntimeConfig();
  return getSearchClient(
    runtimeConfig.azure.search.baseUrl,
    index,
    new AzureKeyCredential(runtimeConfig.azure.search.apiKey),
  );
};
