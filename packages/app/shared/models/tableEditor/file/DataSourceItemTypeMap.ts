import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

export interface DataSourceItemTypeMap {
  [DataSourceType.Csv]: CsvDataSourceItem;
  [DataSourceType.Xlsx]: XlsxDataSourceItem;
}
