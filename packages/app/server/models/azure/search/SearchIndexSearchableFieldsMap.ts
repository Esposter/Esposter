import { SearchIndex } from "@@/server/models/azure/search/SearchIndex";
import { MessageEntityPropertyNames } from "@esposter/db";
import { FileEntityPropertyNames } from "@esposter/shared";

export const SearchIndexSearchableFieldsMap = {
  [SearchIndex.Messages]: [
    MessageEntityPropertyNames.message,
    `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.filename}`,
  ] as const,
} as const satisfies Record<SearchIndex, readonly string[]>;
