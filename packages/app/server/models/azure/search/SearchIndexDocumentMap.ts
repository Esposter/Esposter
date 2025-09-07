import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";

export interface SearchIndexDocumentMap {
  [SearchIndex.Messages]: MessageEntity;
}
