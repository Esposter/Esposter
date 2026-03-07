import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { XlsxDataSourceConfiguration } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";

export interface DataSourceConfigurationTypeMap {
  [DataSourceType.Csv]: CsvDataSourceConfiguration;
  [DataSourceType.Xlsx]: XlsxDataSourceConfiguration;
}
