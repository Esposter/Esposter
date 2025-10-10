import { SearchIndex } from "@/models/azure/search/SearchIndex";
import { FileEntityPropertyNames } from "@/models/azure/table/FileEntity";
import { MessageEntityPropertyNames } from "@/models/message/MessageEntity";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [
    MessageEntityPropertyNames.message,
    `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.filename}`,
  ] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
