import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import type { XlsxDataSourceConfiguration } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface DataSourceConfigurationTypeMap {
  [DataSourceType.Csv]: CsvDataSourceConfiguration;
  [DataSourceType.Xlsx]: XlsxDataSourceConfiguration;
}
