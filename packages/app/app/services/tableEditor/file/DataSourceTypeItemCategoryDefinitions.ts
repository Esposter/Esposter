import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Api]: { title: "API" },
  [DataSourceType.Csv]: { title: "CSV" },
  [DataSourceType.Excel]: { title: "Excel" },
  [DataSourceType.Sql]: { title: "SQL" },
} as const satisfies Record<DataSourceType, Except<SelectItemCategoryDefinition<DataSourceType>, "value">>;

export const DataSourceTypeItemCategoryDefinitions: SelectItemCategoryDefinition<DataSourceType>[] =
  parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
