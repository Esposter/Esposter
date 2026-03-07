import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface DataSourceItemTypeMap {
  [DataSourceType.Csv]: CsvDataSourceItem;
}
