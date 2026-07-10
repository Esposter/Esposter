import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    icon: "mdi-file-delimited",
    title: DataSourceType.Csv,
  },
  [DataSourceType.Json]: {
    icon: "mdi-code-json",
    title: DataSourceType.Json,
  },
  [DataSourceType.Xlsx]: {
    icon: "mdi-file-excel",
    title: DataSourceType.Xlsx,
  },
} as const satisfies Record<DataSourceType, { icon: string; title: string }>;

export const DataSourceTypeItemCategoryDefinitions: (SelectItemCategoryDefinition<DataSourceType> & {
  icon: string;
})[] = parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
