import { SearchIndex } from "#src/models/azure/search/SearchIndex";
import { FileEntityPropertyNames } from "#src/models/azure/table/FileEntity";
import { StandardMessageEntityPropertyNames } from "#src/models/message/StandardMessageEntity";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [
    StandardMessageEntityPropertyNames.message,
    `${StandardMessageEntityPropertyNames.files}/${FileEntityPropertyNames.filename}`,
  ] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
