import type { MessageEntity } from "#src/models/message/MessageEntity";

import { SearchIndex } from "#src/models/azure/search/SearchIndex";

export interface SearchIndexDocumentMap {
  [SearchIndex.Messages]: MessageEntity;
}
