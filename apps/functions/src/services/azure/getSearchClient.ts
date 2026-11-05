import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { DefaultAzureCredential } from "@azure/identity";
import { getSearchClient as baseGetSearchClient } from "@esposter/db";

const credential = new DefaultAzureCredential();

export const getSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> =>
  baseGetSearchClient(process.env.AZURE_SEARCH_BASE_URL, index, credential);
