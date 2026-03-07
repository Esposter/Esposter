import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface DataSourceItemTypeMap {
  [DataSourceType.Csv]: CsvDataSourceItem;
  [DataSourceType.Xlsx]: XlsxDataSourceItem;
}
