import type { SearchIndex } from "#src/models/azure/search/SearchIndex";
import type { MessageEntity } from "#src/models/message/MessageEntity";

export interface SearchIndexDocumentMap {
  [SearchIndex.Messages]: MessageEntity;
}
