import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

export interface DataSourceItemTypeMap {
  [DataSourceType.Csv]: CsvDataSourceItem;
  [DataSourceType.Json]: JsonDataSourceItem;
  [DataSourceType.Xlsx]: XlsxDataSourceItem;
}
