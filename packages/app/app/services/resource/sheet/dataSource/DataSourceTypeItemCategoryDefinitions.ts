import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

// The enum member is the storage name; the title is what a reader is shown, and a file format is written the way
// The format is written — CSV, not Csv. Every surface that names a format takes it from here, so the import menu,
// The export menu, the export dialog's own heading and the Settings type select cannot spell one three ways
export const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    icon: "mdi-file-delimited",
    title: "CSV",
  },
  [DataSourceType.Json]: {
    icon: "mdi-code-json",
    title: "JSON",
  },
  [DataSourceType.Xlsx]: {
    icon: "mdi-file-excel",
    title: "XLSX",
  },
} as const satisfies Record<DataSourceType, { icon: string; title: string }>;

export const DataSourceTypeItemCategoryDefinitions: (SelectItemCategoryDefinition<DataSourceType> & {
  icon: string;
})[] = parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
