import type { SearchIndex } from "@esposter/db-schema";

import { DefaultAzureCredential } from "@azure/identity";
import { getSearchClient as baseGetSearchClient } from "@esposter/db";

const credential = new DefaultAzureCredential();

export const getSearchClient = <TIndex extends SearchIndex>(index: TIndex) =>
  baseGetSearchClient(process.env.AZURE_SEARCH_BASE_URL, index, credential);
