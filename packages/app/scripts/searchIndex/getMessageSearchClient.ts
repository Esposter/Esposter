import type { SearchIndexDocumentMap } from "@esposter/db-schema";

import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { SearchIndex } from "@esposter/db-schema";

// Scripts run outside Nitro, so `useSearchClient`'s runtime config is unreachable; the app's typed env holds
// The same base URL and key that config is built from.
export const getMessageSearchClient = (): SearchClient<SearchIndexDocumentMap[SearchIndex.Messages]> =>
  new SearchClient<SearchIndexDocumentMap[SearchIndex.Messages]>(
    process.env.AZURE_SEARCH_BASE_URL,
    SearchIndex.Messages,
    new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
  );
