import type { MessageEntity } from "@/models/message/MessageEntity";

import { SearchIndex } from "@/models/azure/search/SearchIndex";

export interface SearchIndexDocumentMap {
  [SearchIndex.Messages]: MessageEntity;
}
