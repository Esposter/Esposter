import type { MessageEntity } from "@esposter/db";

import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";

export interface SearchIndexDocumentMap {
  [SearchIndex.Messages]: MessageEntity;
}
