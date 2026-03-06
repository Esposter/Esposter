import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const DataSourceItemTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    create: () => new CsvDataSourceItem(),
    icon: "mdi-file-delimited",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: DataSourceType.Csv,
  },
} as const satisfies Partial<
  Record<DataSourceType, Except<ItemCategoryDefinition<ADataSourceItem<DataSourceType>>, "value">>
>;

export const DataSourceItemTypeItemCategoryDefinitions: ItemCategoryDefinition<ADataSourceItem<DataSourceType>>[] =
  parseDictionaryToArray(DataSourceItemTypeItemCategoryDefinitionMap, "value");
