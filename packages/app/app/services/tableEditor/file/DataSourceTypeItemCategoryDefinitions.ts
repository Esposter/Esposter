import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { ItemEntityTypePropertyNames } from "@esposter/shared";
import { serializeCsv } from "@/services/tableEditor/file/csv/serializeCsv";
import { serializeXlsx } from "@/services/tableEditor/file/xlsx/serializeXlsx";

const DataSourceTypeItemCategoryDefinitionMap = {
  [DataSourceType.Csv]: {
    create: () => new CsvDataSourceItem(),
    icon: "mdi-file-delimited",
    serializeDataSource: (dataSource: DataSource) => serializeCsv(dataSource, new CsvDataSourceItem()),
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: DataSourceType.Csv,
  },
  [DataSourceType.Xlsx]: {
    create: () => new XlsxDataSourceItem(),
    icon: "mdi-file-excel",
    serializeDataSource: (dataSource: DataSource) => serializeXlsx(dataSource, new XlsxDataSourceItem()),
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: DataSourceType.Xlsx,
  },
} as const satisfies Partial<
  Record<
    DataSourceType,
    Except<ItemCategoryDefinition<ADataSourceItem<DataSourceType>>, "value"> & {
      serializeDataSource: (dataSource: DataSource) => Promise<Blob>;
    }
  >
>;

export const DataSourceTypeItemCategoryDefinitions: (ItemCategoryDefinition<ADataSourceItem<DataSourceType>> & {
  serializeDataSource: (dataSource: DataSource) => Promise<Blob>;
})[] = parseDictionaryToArray(DataSourceTypeItemCategoryDefinitionMap, "value");
