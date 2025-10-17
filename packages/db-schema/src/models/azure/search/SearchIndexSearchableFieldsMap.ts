import { SearchIndex } from "@/models/azure/search/SearchIndex";
import { FileEntityPropertyNames } from "@/models/azure/table/FileEntity";
import { StandardMessageEntityPropertyNames } from "@/models/message/StandardMessageEntity";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [
    StandardMessageEntityPropertyNames.message,
    `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.filename}`,
  ] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
