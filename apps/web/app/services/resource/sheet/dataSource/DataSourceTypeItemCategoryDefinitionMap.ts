// @unocss-include
import type { SelectItemCategoryDefinition } from "@/models/shared/SelectItemCategoryDefinition";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

// Exported for the icon: the import and export submenus show each format against its own, and only this map
// Knows which one that is. The description is what the Settings blade says under each format it offers
export const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    description: "Comma-separated text, one row to a line",
    icon: "i-mdi:file-delimited",
    title: DataSourceType.Csv,
  },
  [DataSourceType.Json]: {
    description: "An array of objects, one row to an object",
    icon: "i-mdi:code-json",
    title: DataSourceType.Json,
  },
  [DataSourceType.Xlsx]: {
    description: "An Excel workbook, read one sheet at a time",
    icon: "i-mdi:file-excel",
    title: DataSourceType.Xlsx,
  },
} as const satisfies Record<DataSourceType, { description: string; icon: string; title: string }>;

export const DataSourceTypeItemCategoryDefinitions: (SelectItemCategoryDefinition<DataSourceType> & {
  description: string;
})[] = parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
