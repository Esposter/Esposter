import type { SearchClient } from "@azure/search-documents";
import type { SearchIndex, SearchIndexDocumentMap } from "@esposter/db-schema";

import { MockSearchClient } from "azure-mock";
import { describe } from "vitest";

export const useSearchClient = <TIndex extends SearchIndex>(
  index: TIndex,
): SearchClient<SearchIndexDocumentMap[TIndex]> =>
  new MockSearchClient(index) as unknown as SearchClient<SearchIndexDocumentMap[TIndex]>;

describe.todo("useSearchClient");
