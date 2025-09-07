import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [MessageEntityPropertyNames.message, MessageEntityPropertyNames.linkPreviewResponse] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
