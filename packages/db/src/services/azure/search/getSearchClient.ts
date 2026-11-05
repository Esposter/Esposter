import type { SearchCredential } from "#src/models/azure/search/SearchCredential";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { SearchClient } from "@azure/search-documents";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The one construction of a search client. The caller brings the credential, since the web app reads with its API key
// And the functions app writes with its managed identity. An empty endpoint is refused here, so a missing app setting
// Fails by its name rather than inside the SDK
export const getSearchClient = <TIndex extends SearchIndex>(
  baseUrl: string,
  index: TIndex,
  credential: SearchCredential,
): SearchClient<SearchIndexDocumentMap[TIndex]> => {
  if (!baseUrl) throw new InvalidOperationError(Operation.Read, getSearchClient.name, "the search endpoint is not set");
  return new SearchClient<SearchIndexDocumentMap[TIndex]>(baseUrl, index, credential);
};
