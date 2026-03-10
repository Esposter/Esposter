import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    create: () => new CsvDataSourceItem(),
    icon: "mdi-file-delimited",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: DataSourceType.Csv,
  },
  [DataSourceType.Xlsx]: {
    create: () => new XlsxDataSourceItem(),
    icon: "mdi-file-excel",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: DataSourceType.Xlsx,
  },
} as const satisfies Record<DataSourceType, Except<ItemCategoryDefinition<ADataSourceItem<DataSourceType>>, "value">>;

export const DataSourceTypeItemCategoryDefinitions: ItemCategoryDefinition<ADataSourceItem<DataSourceType>>[] =
  parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
