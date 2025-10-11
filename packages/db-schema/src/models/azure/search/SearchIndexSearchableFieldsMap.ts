import { SearchIndex } from "@/models/azure/search/SearchIndex";
import { FileEntityPropertyNames } from "@/models/azure/table/FileEntity";
import { BaseMessageEntityPropertyNames } from "@/models/message/BaseMessageEntity";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [
    BaseMessageEntityPropertyNames.message,
    `${BaseMessageEntityPropertyNames.files}/${FileEntityPropertyNames.filename}`,
  ] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
